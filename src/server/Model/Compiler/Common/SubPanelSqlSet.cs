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
    public class SubPanelSqlSet : UnionedSet
    {
        public SubPanelSqlSet(Panel panel, CompilerOptions compilerOptions)
        {
            var sub = panel.SubPanels.First();
            var pis = sub.PanelItems.Select(pi => new PanelItemSqlSet(panel, sub, pi, compilerOptions));
            Add(pis);
            UnionType = UnionType.All;
        }
    }

    public class SubPanelSequentialSqlSet : UnionedSet
    {
        internal Panel Panel { get; set; }
        internal SubPanel SubPanel { get; set; }

        internal Column PersonId { get; set; }
        internal Column EncounterId { get; set; }
        internal AutoAliasedColumn Date { get; set; }
        internal ISelectable EventId { get; set; }

        SubPanelSequentialSqlSet() { }

        public SubPanelSequentialSqlSet(Panel panel, SubPanel subpanel, CompilerOptions compilerOptions)
        {
            var pis = subpanel.PanelItems.Select(pi => new PanelItemSequentialSqlSet(panel, subpanel, pi, compilerOptions));
            this.Panel = panel;
            this.SubPanel = subpanel;

            Add(pis);
            SetSelect();
            UnionType = UnionType.All;
        }

        void SetSelect()
        {
            var first = this.First() as PanelItemSequentialSqlSet;

            PersonId = new Column(first.PersonId);
            EncounterId = new Column(first.EncounterId);
            Date = new AutoAliasedColumn(first.Date.Name, first.Date.AliasMarker);
            EventId = GetEventId(first);
        }

        Column GetEventId(PanelItemSequentialSqlSet first)
        {
            if (first.EventId is AutoAliasedColumn aliased)
            {
                return new AutoAliasedColumn(aliased.Name, aliased.AliasMarker);
            }
            if (first.EventId is ExpressedColumn exprs)
            {
                return new Column(exprs.Name);
            }
            return null;
        }
    }
}
