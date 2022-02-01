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
    public class DatasetJoinedSqlSet : PanelSequentialSqlSet
    {
        public Column Salt { get; protected set; }
        readonly string queryParamPlaceholder = "___queryid___";

        public DatasetJoinedSqlSet(
            Panel panel,
            CompilerOptions compilerOptions,
            ISqlDialect dialect) : base(panel, compilerOptions, dialect)
        {
            var sp = GetCachedCohortSubPanel(compilerOptions);
            var cache = new DatasetCachedPanelItemSqlSet(panel, sp, sp.PanelItems.First(), compilerOptions, dialect);
            var join  = new DatasetJoinedSequentialSqlSet(cache);
            var first = From.First() as JoinedSequentialSqlSet;
            var last  = From.Last() as JoinedSequentialSqlSet;

            first.On = new[] { join.PersonId == first.PersonId };
            first.Type = JoinType.Inner;

            Select = new ISelectable[] 
            { 
                new ExpressedColumn(last.PersonId, DatasetColumns.PersonId),
                new ExpressedColumn(last.EncounterId, EncounterColumns.EncounterId), 
                join.Salt 
            };
            From    = From.Prepend(join);
            GroupBy = new[] { last.PersonId, last.EncounterId, join.Salt };
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

    class DatasetJoinedSequentialSqlSet : Join
    {
        public Column PersonId { get; protected set; }
        public Column Salt { get; protected set; }

        public DatasetJoinedSequentialSqlSet(DatasetCachedPanelItemSqlSet set)
        {
            Set = set;
            Alias = $"{SqlCommon.Alias.Sequence}C";
            PersonId = new Column(set.PersonId, this);
            Salt = new Column(set.Salt, this);
        }
    }

    class DatasetCachedPanelItemSqlSet : PanelItemSequentialSqlSet
    {
        public Column Salt { get; protected set; }
        internal Panel Panel { get; set; }
        internal SubPanel SubPanel { get; set; }
        internal CompilerOptions CompilerOptions { get; set; }

        public DatasetCachedPanelItemSqlSet(
            Panel panel,
            SubPanel subpanel,
            PanelItem panelitem,
            CompilerOptions comp,
            ISqlDialect dialect) : base(panel, subpanel, panelitem, comp, dialect)
        {
            Panel = panel;
            SubPanel = subpanel;
            CompilerOptions = comp;
        }

        internal override void SetSelect()
        {
            PersonId = new Column("PersonId");
            Salt = new Column("Salt");
            Select = new[] { PersonId, Salt };
        }
    }
}
