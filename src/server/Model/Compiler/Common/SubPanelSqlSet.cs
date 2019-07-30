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
            var sub = panel.SubPanels.ElementAt(0);
            var pis = sub.PanelItems.Select(pi => new PanelItemSqlSet(panel, sub, pi, compilerOptions));
            Add(pis);
            UnionType = UnionType.All;
        }
    }

    public class SubPanelSequentialSqlSet : UnionedSet
    {
        internal CompilerOptions compilerOptions;

        internal Panel Panel { get; set; }
        internal SubPanel SubPanel { get; set; }

        public Column PersonId { get; protected set; }
        public Column EncounterId { get; protected set; }
        public Column EventId { get; protected set; }
        public Column Date { get; protected set; }

        SubPanelSequentialSqlSet() { }

        public SubPanelSequentialSqlSet(Panel panel, SubPanel subpanel, CompilerOptions compilerOptions)
        {
            var pis = subpanel.PanelItems.Select(pi => new PanelItemSequentialSqlSet(panel, subpanel, pi, compilerOptions));
            this.compilerOptions = compilerOptions;
            this.Panel = panel;
            this.SubPanel = subpanel;

            SetSelect();
            Add(pis);
            UnionType = UnionType.All;
        }

        void SetSelect()
        {
            var first = SubPanel.PanelItems.FirstOrDefault().Concept;
            var seq = SubPanel.JoinSequence.SequenceType;

            PersonId = new Column(compilerOptions.FieldPersonId);
            EncounterId = new Column(compilerOptions.FieldEncounterId);
            Date = new UnaliasedColumn(first.SqlFieldDate);

            if (seq == SequenceType.Event)
            {
                EventId = new Column(first.SqlFieldEvent);
            }
        }
    }
}
