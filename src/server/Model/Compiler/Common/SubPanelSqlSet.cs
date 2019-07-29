// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Microsoft.Extensions.Options;
using Model.Options;
using Composure;

namespace Model.Compiler.Common
{
    public class SubPanelSqlSet : UnionedSet
    {
        public SubPanelSqlSet(Panel panel, SubPanel subPanel)
        {
            var pis = subPanel.PanelItems.Select(pi => new PanelItemSqlSet(panel, subPanel, pi));
            Add(pis);
        }
    }

    public class SubPanelSequentialSqlSet : VirtualSet
    {
        readonly CompilerOptions compilerOptions;
        readonly Panel panel;
        readonly SubPanel subpanel;

        public Column PersonId { get; protected set; }
        public Column EncounterId { get; protected set; }
        public Column EventId { get; protected set; }
        public Column Date { get; protected set; }

        internal SubPanelJoinSequence JoinSequence => subpanel.JoinSequence;

        new string Alias => $"{Dialect.Alias.Sequence}{subpanel.Index}";

        public SubPanelSequentialSqlSet(Panel panel, SubPanel subpanel)
        {
            this.panel = panel;
            this.subpanel = subpanel;
            base.Alias = Alias;

            var pis = subpanel.PanelItems.Select(pi => new PanelItemSequentialSqlSet(panel, subpanel, pi));
            From = new UnionedSet(pis);
            
            SetSelect();
        }

        void SetSelect()
        {
            var firstConcept = subpanel.PanelItems.FirstOrDefault().Concept;
            var seq = subpanel.JoinSequence.SequenceType;

            PersonId = new Column(compilerOptions.FieldPersonId);
            EncounterId = new Column(compilerOptions.FieldEncounterId);
            Date = new Column(firstConcept.SqlFieldDate);

            if (seq == SequenceType.Event)
            {
                EventId = new Column(firstConcept.SqlFieldEvent);
                Select = new[] { PersonId, EncounterId, EventId, Date };
            }
            else
            {
                Select = new[] { PersonId, EncounterId, Date };
            }
            
        }
    }
}
