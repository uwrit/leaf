// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Options;
using Model.Compiler;
using Model.Compiler.SqlServer;
using Model.Options;
using Model.Compiler.Common;
using Tests.Mock.Models.Compiler;
using Xunit;
using System;

namespace Tests
{
    public class SqlCompilerTests
    {
        readonly SqlServerCompiler Compiler = MockOptions.GenerateSqlServerCompiler();
        readonly CompilerOptions Options = MockOptions.GenerateOmopOptions().Value;

        int GetIndex(string text, string searchText) => text.IndexOf(searchText, StringComparison.InvariantCultureIgnoreCase);

        string GetContentBetween(string text, string start, string end)
        {
            var afterStart = GetIndex(text, start) + end.Length;
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

        [Fact]
        public void Person_Level_Query_Returns_Single_Column()
        {
            var panel = MockPanel.Panel;
            var ob = new SubPanelSqlSet(panel, Options);
            var sql = ob.ToString();
            var cols = GetColumns(sql);
            var col = StripSetAlias(cols[0]);

            Assert.Single(cols);
            Assert.Equal(Options.FieldPersonId, col);
        }

        [Fact]
        public void Multiple_Panel_Items_In_Subpanel_Returns_Union()
        {
            var panel = MockPanel.Panel;
            panel.SubPanels.ElementAt(0).PanelItems = new List<PanelItem>() { MockPanel.EdEnc, MockPanel.HmcEnc };
            var ob = new SubPanelSqlSet(panel, Options);
            var sql = ob.ToString();

            Assert.Contains("UNION ALL", "sql");
        }

        [Fact]
        public void Sequence_Level_Query_Returns_Single_Column()
        {
            var panel = MockPanel.Panel;
            panel.SubPanels.Add(new SubPanel
            {
                Index = 1,
                PanelIndex = 0,
                IncludeSubPanel = true,
                PanelItems = new[] { MockPanel.HmcEnc },
                JoinSequence = MockPanel.EncJoin
            });

            var ob = new PanelSequentialSqlSet(panel, Options);
            var sql = ob.ToString();
            var cols = GetColumns(sql);
            var col = StripSetAlias(cols[0]);

            Assert.Single(cols);
            Assert.Equal(Options.FieldPersonId, col);
        }

        [Fact]
        public void Sequence_Level_Subquery_Returns_Four_Columns()
        {
            var panel = MockPanel.Panel;
            panel.SubPanels.Add(new SubPanel
            {
                Index = 1,
                PanelIndex = 0,
                IncludeSubPanel = true,
                PanelItems = new[] { MockPanel.HmcEnc },
                JoinSequence = MockPanel.EncJoin
            });

            var ob = new PanelSequentialSqlSet(panel, Options);
            var sql = ob.ToString();
            var colsStr = GetContentBetween(sql, "(SELECT", "FROM Encounter");
            var cols = colsStr.Trim().Split(',', StringSplitOptions.RemoveEmptyEntries);

            Assert.Equal(4, cols.Length);
        }
    }
}
