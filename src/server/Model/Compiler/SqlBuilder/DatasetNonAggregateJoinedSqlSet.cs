// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Model.Options;
using Composure;
namespace Model.Compiler.SqlBuilder
{
    public class DatasetNonAggregateJoinedSqlSet : PanelSequentialSqlSet
    {
        public Column Salt { get; protected set; }
        readonly string queryParamPlaceholder = "___queryid___";
        readonly ICachedCohortPreparer cachedCohortPreparer;

        public DatasetNonAggregateJoinedSqlSet(
            Panel panel,
            CompilerOptions compilerOptions,
            ISqlDialect dialect,
            ICachedCohortPreparer cachedCohortPreparer) : base(panel, compilerOptions, dialect)
        {
            this.cachedCohortPreparer = cachedCohortPreparer;

            var sp = GetCachedCohortSubPanel();
            var cache = new DatasetCachedPanelItemSqlSet(panel, sp, sp.PanelItems.First(), compilerOptions, dialect);
            var join = new DatasetJoinedSequentialSqlSet(cache);
            var first = From.First() as JoinedSequentialSqlSet;
            var last = From.Last() as JoinedSequentialSqlSet;

            first.On = new[] { join.PersonId == first.PersonId };
            first.Type = JoinType.Inner;

            Select = new ISelectable[]
            {
                new ExpressedColumn(
                    new Expression(dialect.Convert(ColumnType.String, last.PersonId)),
                    DatasetColumns.PersonId),
                new ExpressedColumn(
                    new Expression(dialect.Convert(ColumnType.String, last.EncounterId)),
                    EncounterColumns.EncounterId),
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
                .Replace(queryParamPlaceholder, "@" + ShapedDatasetCompilerContext.QueryIdParam);
        }

        SubPanel GetCachedCohortSubPanel()
        {
            return new SubPanel
            {
                PanelItems = new PanelItem[]
                {
                    new PanelItem
                    {
                        Concept = new Concept
                        {
                            SqlSetFrom = cachedCohortPreparer.CohortToCteFrom(),
                            SqlSetWhere = cachedCohortPreparer.CohortToCteWhere()
                                .Replace("@" + ShapedDatasetCompilerContext.QueryIdParam, queryParamPlaceholder)
                        }
                    }
                }
            };
        }
    }
}
