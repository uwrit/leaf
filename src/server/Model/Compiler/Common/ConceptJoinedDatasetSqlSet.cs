// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Composure;
using Model.Options;

namespace Model.Compiler.Common
{
    class ConceptJoinedDatasetSqlSet : PanelSequentialSqlSet
    {
        internal Panel Panel { get; set; }
        internal CompilerOptions CompilerOptions { get; set; }

        string queryParamPlaceholder = "___queryid___";

        public ConceptJoinedDatasetSqlSet(Panel panel, CompilerOptions comp) : base(panel, comp)
        {
            var sp = GetCachedCohortSubPanel(comp);
            var cache = new DatasetCachedPanelItemSqlSet(panel, sp, sp.PanelItems.First(), comp);
            var join = new DatasetJoinedSequentialSqlSet(cache);
            var first = From.First() as JoinedSequentialSqlSet;

            first.On = new[] { join.PersonId == first.PersonId };
            first.Type = JoinType.Inner;

            Select = new ISelectable[]
            {
                new ExpressedColumn(first.PersonId, DatasetColumns.PersonId),
                join.Salt
            };
            From = From.Prepend(join);
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

    class ConceptDatasetSqlSet : PanelItemSqlSet
    {
        internal Panel Panel { get; set; }
        internal SubPanel SubPanel { get; set; }
        internal PanelItem PanelItem { get; set; }
        internal CompilerOptions CompilerOptions { get; set; }

        public ConceptDatasetSqlSet(Panel panel, SubPanel subpanel, PanelItem panelitem, CompilerOptions comp) : base(panel, subpanel, panelitem, comp)
        {
            Panel = panel;
            SubPanel = subpanel;
            PanelItem = PanelItem;
            CompilerOptions = comp;
        }

        internal override void SetSelect()
        {
            var cols = new List<ExpressedColumn>();
            var personId = new ExpressedColumn(PersonId, "PersonId");
            var dateField = new ExpressedColumn(Date, "DateField");

            cols.Add(personId);
            cols.Add(dateField);

            if (PanelItem.Concept.IsNumeric)
            {
                var numericField = new ExpressedColumn(new Column(Number), "NumberField");
                cols.Add(numericField);
            }

            Select = cols;
        }
    }
}
