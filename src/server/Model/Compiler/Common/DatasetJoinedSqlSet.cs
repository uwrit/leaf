// Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
    public class DatasetJoinedSqlSet : PanelSequentialSqlSet
    {
        public Column Salt { get; protected set; }

        string queryParamPlaceholder = "___param___";

        public DatasetJoinedSqlSet(Panel panel, CompilerOptions compilerOptions) : base(panel, compilerOptions)
        {
            var sp = GetCachedCohortSubPanel(compilerOptions);
            var cache = new DatasetCachedPanelItemSqlSet(panel, sp, sp.PanelItems.First(), compilerOptions);
            var next = From.First() as JoinedSequentialSqlSet;
            var first = new DatasetJoinedSequentialSqlSet(cache);
            var last = From.Last() as JoinedSequentialSqlSet;
            
            next.On = new[] { first.PersonId == next.PersonId };
            next.Type = JoinType.Inner;

            Select  = new[] { last.PersonId, last.EncounterId, first.Salt };
            From    = From.Prepend(first);
            GroupBy = new[] { last.PersonId, last.EncounterId, first.Salt };
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

    class DatasetCachedPanelItemSqlSet : PanelItemSequentialSqlSet
    {
        public Column Salt { get; protected set; }
        internal Panel Panel { get; set; }
        internal SubPanel SubPanel { get; set; }

        public DatasetCachedPanelItemSqlSet(Panel panel, SubPanel subpanel, PanelItem panelitem, CompilerOptions comp) : base(panel, subpanel, panelitem, comp)
        {
            Panel = panel;
            SubPanel = subpanel;
        }

        internal override void SetSelect()
        {
            Salt = new Column("Salt");
            Select = new[] { PersonId, Salt };
        }
    }

    class DatasetJoinedSequentialSqlSet : Join
    {
        public Column PersonId { get; protected set; }
        public Column Salt { get; protected set; }

        public DatasetJoinedSequentialSqlSet(DatasetCachedPanelItemSqlSet set)
        {
            Set = set;
            Alias = $"{Dialect.Alias.Sequence}C";
            PersonId = new Column(set.PersonId, this);
            Salt = new Column(set.Salt, this);
        }
    }
}
