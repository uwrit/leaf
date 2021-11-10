// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Model.Options;
using Composure;
namespace Model.Compiler.Common
{
    public class DatasetNonAggregateJoinedSqlSet : PanelSequentialSqlSet
    {
        public Column Salt { get; protected set; }
        readonly string queryParamPlaceholder = "___queryid___";

        public DatasetNonAggregateJoinedSqlSet(Panel panel, CompilerOptions compilerOptions) : base(panel, compilerOptions)
        {
            var sp = GetCachedCohortSubPanel(compilerOptions);
            var cache = new DatasetCachedPanelItemSqlSet(panel, sp, sp.PanelItems.First(), compilerOptions);
            var join = new DatasetJoinedSequentialSqlSet(cache);
            var first = From.First() as JoinedSequentialSqlSet;
            var last = From.Last() as JoinedSequentialSqlSet;

            // Ensure personId and encounterId are always strings
            static Expression toNvarchar(Column x) => new Expression($"CONVERT(NVARCHAR(100), {x})");

            first.On = new[] { join.PersonId == first.PersonId };
            first.Type = JoinType.Inner;

            Select = new ISelectable[]
            {
                new ExpressedColumn(toNvarchar(last.PersonId), DatasetColumns.PersonId),
                new ExpressedColumn(toNvarchar(last.EncounterId), EncounterColumns.EncounterId),
                new ExpressedColumn(last.Date, ConceptColumns.DateField),
                join.Salt
            };
            From = From.Prepend(join);
            GroupBy = null;
            Having = null;
        }

        public override string ToString()
        {
            return base.ToString()
                .Replace(queryParamPlaceholder, ShapedDatasetCompilerContext.QueryIdParam);
        }

        SubPanel GetCachedCohortSubPanel(CompilerOptions compilerOptions)
        {
            return new SubPanel
            {
                PanelItems = new PanelItem[]
                {
                    new PanelItem
                    {
                        Concept = new Concept
                        {
                            SqlSetFrom = $"{compilerOptions.AppDb}.app.Cohort",
                            SqlSetWhere = $"{compilerOptions.Alias}.QueryId = {queryParamPlaceholder} AND {compilerOptions.Alias}.Exported = 1"
                        }
                    }
                }
            };
        }
    }
}
