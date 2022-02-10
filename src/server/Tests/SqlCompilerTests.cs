// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Collections.Generic;
using System.Linq;
using Model.Compiler;
using Model.Options;
using Model.Compiler.SqlBuilder;
using Tests.Mock.Models.Compiler;
using Xunit;
using System;
using Services.Compiler.SqlBuilder;
using Services.Cohort;

namespace Tests
{
    public class SqlCompilerTests
    {
        static readonly CompilerOptions Options = MockOptions.GenerateOmopOptions().Value;
        static readonly ICachedCohortPreparer cachedCohortPreparer = new SharedSqlServerCachedCohortPreparer(null, dialect, MockOptions.GenerateOmopOptions());
        static readonly ISqlDialect dialect = new TSqlDialect();

        #region Helpers
        int GetIndex(string text, string searchText) => text.IndexOf(searchText, StringComparison.InvariantCultureIgnoreCase);

        string GetContentBetween(string text, string start, string end)
        {
            var afterStart = GetIndex(text, start) + start.Length;
            var len = GetIndex(text, end) - afterStart;
            return text.Substring(afterStart, len);
        }

        string[] GetColumns(string sql)
        {
            var colsStr = GetContentBetween(sql, "SELECT", "FROM");
            var splt = colsStr.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            return splt;
        }

        string StripSetAlias(string col)
        {
            var per = GetIndex(col, ".") + 1;
            return col.Substring(per, col.Length - per);
        }
        #endregion

        [Fact]
        public void Person_Level_Query_Returns_Single_Column()
        {
            var panel = MockPanel.Panel();
            var ob = new SubPanelSqlSet(panel, Options, dialect);
            var sql = ob.ToString();
            var cols = GetColumns(sql);
            var col = StripSetAlias(cols[0]).Trim();

            Assert.Single(cols);
            Assert.Equal(Options.FieldPersonId, col);
        }

        [Fact]
        public void Where_Clause_Added_If_Panel_Has_Where()
        {
            var panel = MockPanel.Panel();
            var pi = MockPanel.EdEnc();

            /*
             * No WHERE clause
             */
            pi.Concept.SqlSetWhere = null;
            panel.SubPanels.ElementAt(0).PanelItems = new[] { pi };
            var ob = new SubPanelSqlSet(panel, Options, dialect);

            Assert.DoesNotContain("WHERE", ob.ToString());

            /*
             * One WHERE clause
             */
            pi.Concept.SqlSetWhere = "1 = 1";
            ob = new SubPanelSqlSet(panel, Options, dialect);

            Assert.Contains("WHERE 1 = 1", ob.ToString());

            /*
             * Two WHERE clauses
             */
            pi.Concept.SqlFieldNumeric = "Num";
            pi.NumericFilter = new NumericFilter { Filter = new[] { 5.0M }, FilterType = NumericFilterType.EqualTo };
            ob = new SubPanelSqlSet(panel, Options, dialect);

            Assert.Contains("WHERE 1 = 1 AND Num = 5.0", ob.ToString());
        }

        [Fact]
        public void Specialization_Where_Clauses_Added()
        {
            var panel = MockPanel.Panel();
            var pi = MockPanel.EdEnc();
            var specs = new List<ConceptSpecialization>
            {
                new ConceptSpecialization { Id = Guid.NewGuid(), SpecializationGroupId = 1, SqlSetWhere = "2 = 2" }
            };

            pi.Concept.SqlSetWhere = null;
            panel.SubPanels.ElementAt(0).PanelItems = new[] { pi };
            pi.Specializations = specs;
            
            /*
             * One specialization
             */
            var ob = new SubPanelSqlSet(panel, Options, dialect);

            Assert.Contains("WHERE 2 = 2", ob.ToString());

            /*
             * Two specializations
             */
            specs.Add(new ConceptSpecialization { Id = Guid.NewGuid(), SpecializationGroupId = 2, SqlSetWhere = "'A' = 'A'" });
            ob = new SubPanelSqlSet(panel, Options, dialect);
            Assert.Contains("WHERE 2 = 2 AND 'A' = 'A'", ob.ToString());

            /*
             * Two specializations with a normal WHERE clause
             */
            pi.Concept.SqlSetWhere = "1 = 1";
            ob = new SubPanelSqlSet(panel, Options, dialect);

            Assert.Contains("WHERE 1 = 1 AND 2 = 2 AND 'A' = 'A'", ob.ToString());
        }

        [Fact]
        public void Alias_Placeholder_Filled()
        {
            var panel = MockPanel.Panel();
            var pi = MockPanel.EdEnc();
            var expectedAlias = "_S000";
            pi.Concept.SqlSetWhere = "@.X != @.Y";
            panel.SubPanels.ElementAt(0).PanelItems = new[] { pi };

            var ob = new SubPanelSqlSet(panel, Options, dialect);
            Assert.Contains($"{expectedAlias}.X != {expectedAlias}.Y", ob.ToString());
        }

        [Fact]
        public void Dummy_EventId_Field_Added_If_Absent()
        {
            var panel = MockPanel.Panel();
            panel.SubPanels.Add(new SubPanel
            {
                Index = 1,
                PanelIndex = 0,
                IncludeSubPanel = true,
                PanelItems = new[] { MockPanel.HmcEnc() },
                JoinSequence = new SubPanelJoinSequence { SequenceType = SequenceType.Encounter }
            });

            var ob = new PanelSequentialSqlSet(panel, Options, dialect);
            var sql = ob.ToString();
            var colsStr = GetContentBetween(sql, "(SELECT", "FROM Encounter");
            var cols = colsStr.Trim().Split(',', StringSplitOptions.RemoveEmptyEntries);
            var defaultNoField = "'' AS EventId";
            var included = cols.Any(c => c.Trim().Equals(defaultNoField));

            Assert.True(included);
        }

        [Fact]
        public void EventId_Field_Included_If_Present()
        {
            var panel = MockPanel.Panel();
            var field = "EventField";
            var field2 = "EventishField";
            var pi = MockPanel.EdEnc();
            var pi2 = MockPanel.HmcEnc();

            pi.Index = 0;
            pi.Concept.IsEventBased = true;
            pi.Concept.SqlFieldEvent = $"{Options.Alias}.{field}";

            pi2.Index = 0;
            pi2.SubPanelIndex = 1;
            pi2.Concept.IsEventBased = true;
            pi2.Concept.SqlFieldEvent = $"{Options.Alias}.{field2}";

            panel.SubPanels.ElementAt(0).PanelItems = new[] { pi };
            panel.SubPanels.Add(new SubPanel
            {
                Index = 1,
                PanelIndex = 0,
                IncludeSubPanel = true,
                PanelItems = new[] { pi2 },
                JoinSequence = new SubPanelJoinSequence { SequenceType = SequenceType.Event }
            });

            var ob = new PanelSequentialSqlSet(panel, Options, dialect);
            var sql = ob.ToString();
            var expectedAlias1 = "_S000";
            var expectedAlias2 = "_S010";

            /*
             * Event fields added with alias.
             */
            Assert.Contains($"{expectedAlias1}.{field}", sql);
            Assert.Contains($"{expectedAlias2}.{field2}", sql);

            /*
             * Event fields inherited into parent set and join with parent alias.
             */
            var expectedParentAlias1 = "_T0";
            var expectedParentAlias2 = "_T1";

            Assert.Contains($"{expectedParentAlias1}.{field} = {expectedParentAlias2}.{field2}", sql);
        }

        [Fact]
        public void Multiple_Panel_Items_In_Subpanel_Returns_Union()
        {
            var panel = MockPanel.Panel();
            panel.SubPanels.ElementAt(0).PanelItems = new List<PanelItem>() { MockPanel.EdEnc(), MockPanel.HmcEnc() };
            var ob = new SubPanelSqlSet(panel, Options, dialect);
            var sql = ob.ToString();

            Assert.Contains("UNION ALL", sql);
        }

        [Fact]
        public void Sequence_Level_Query_Returns_Single_Column()
        {
            var panel = MockPanel.Panel();
            panel.SubPanels.Add(new SubPanel
            {
                Index = 1,
                PanelIndex = 0,
                IncludeSubPanel = true,
                PanelItems = new[] { MockPanel.HmcEnc() },
                JoinSequence = new SubPanelJoinSequence { SequenceType = SequenceType.Encounter }
            });

            var ob = new PanelSequentialSqlSet(panel, Options, dialect);
            var sql = ob.ToString();
            var cols = GetColumns(sql);
            var col = StripSetAlias(cols[0]);

            Assert.Single(cols);
            Assert.Equal(Options.FieldPersonId, col);
        }

        [Fact]
        public void Sequence_Level_Subquery_Returns_Four_Columns()
        {
            var panel = MockPanel.Panel();
            panel.SubPanels.Add(new SubPanel
            {
                Index = 1,
                PanelIndex = 0,
                IncludeSubPanel = true,
                PanelItems = new[] { MockPanel.HmcEnc() },
                JoinSequence = new SubPanelJoinSequence { SequenceType = SequenceType.Encounter }
            });

            var ob = new PanelSequentialSqlSet(panel, Options, dialect);
            var sql = ob.ToString();
            var colsStr = GetContentBetween(sql, "(SELECT", "FROM Encounter");
            var cols = colsStr.Trim().Split(',', StringSplitOptions.RemoveEmptyEntries);

            Assert.Equal(4, cols.Length);
        }

        [Fact]
        public void Dataset_Joined_Query_Includes_Salt()
        {
            var panel = MockPanel.Panel();
            panel.SubPanels.Add(new SubPanel
            {
                Index = 1,
                PanelIndex = 0,
                IncludeSubPanel = true,
                PanelItems = new[] { MockPanel.HmcEnc() },
                JoinSequence = new SubPanelJoinSequence { SequenceType = SequenceType.Encounter }
            });

            var ob = new DatasetJoinedSqlSet(panel, Options, dialect, cachedCohortPreparer);
            var sql = ob.ToString();

            Assert.Equal(sql, sql);
        }
    }
}
