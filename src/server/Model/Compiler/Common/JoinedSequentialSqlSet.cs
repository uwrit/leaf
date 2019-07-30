// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Composure;

namespace Model.Compiler.Common
{
    class JoinedSequentialSqlSet : Join
    {
        public Column PersonId { get; protected set; }
        public Column EncounterId { get; protected set; }
        public AutoAliasedColumn EventId { get; protected set; }
        public AutoAliasedColumn Date { get; protected set; }

        public JoinedSequentialSqlSet(SubPanelSequentialSqlSet set)
        {
            Set = set;
            SetAlias(set);
            InheritColumns(set);
        }

        public JoinedSequentialSqlSet(SubPanelSequentialSqlSet set, JoinType type)
        {
            Set = set;
            Type = type;
            SetAlias(set);
            InheritColumns(set);
        }

        void SetAlias(SubPanelSequentialSqlSet set)
        {
            Alias = $"{Dialect.Alias.Sequence}{set.SubPanel.Index}";
        }

        void InheritColumns(SubPanelSequentialSqlSet set)
        {
            PersonId = new Column(set.PersonId, this);
            EncounterId = new Column(set.EncounterId, this);
            Date = new AutoAliasedColumn(set.Date, this);

            if (set.IsEventBased)
            {
                EventId = new AutoAliasedColumn(set.EventId, this);
            }
        }
    }
}
