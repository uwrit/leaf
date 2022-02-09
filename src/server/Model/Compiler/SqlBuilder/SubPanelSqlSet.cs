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
    public class SubPanelSqlSet : UnionedSet
    {
        public SubPanelSqlSet(
            Panel panel,
            CompilerOptions compilerOptions,
            ISqlDialect dialect)
        {
            var first = panel.SubPanels.First();
            var union = first.PanelItems.Select(pi => new PanelItemSqlSet(panel, first, pi, compilerOptions, dialect));
            Add(union);
            UnionType = UnionType.All;
        }
    }

    public class SubPanelSequentialSqlSet : UnionedSet
    {
        internal Panel Panel { get; set; }
        internal SubPanel SubPanel { get; set; }

        internal Column PersonId { get; set; }
        internal Column EncounterId { get; set; }
        internal EventIdColumn EventId { get; set; }
        internal AutoAliasedColumn Date { get; set; }

        SubPanelSequentialSqlSet() { }

        public SubPanelSequentialSqlSet(
            Panel panel,
            SubPanel subpanel,
            CompilerOptions compilerOptions,
            ISqlDialect dialect)
        {
            var union = subpanel.PanelItems.Select(pi => new PanelItemSequentialSqlSet(panel, subpanel, pi, compilerOptions, dialect));
            this.Panel = panel;
            this.SubPanel = subpanel;

            Add(union);
            SetSelect();
            UnionType = UnionType.All;
        }

        void SetSelect()
        {
            var first = this.First() as PanelItemSequentialSqlSet;

            PersonId = new Column(first.PersonId);
            EncounterId = new Column(first.EncounterId);
            Date = new AutoAliasedColumn(first.Date.Name, first.Date.AliasMarker);
            EventId = new EventIdColumn(first.EventId);
        }
    }
}
