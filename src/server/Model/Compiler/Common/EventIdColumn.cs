// Copyright(c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Composure;

namespace Model.Compiler.Common
{
    public class EventIdColumn : Column
    {
        const string DefaultName = "EventId";

        public ISelectable InnerColumn { get; set; }

        public EventIdColumn() : base(DefaultName)
        {
            InnerColumn = new ExpressedColumn(DefaultName, new QuotedExpression(""));
        }

        public EventIdColumn(string eventIdColName, string aliasMarker, IAliasedSet set) : base(eventIdColName, set)
        {
            InnerColumn = new AutoAliasedColumn(eventIdColName, aliasMarker, set);
        }

        public EventIdColumn(EventIdColumn column) : base(column)
        {
            InnerColumn = column.InnerColumn;
        }

        public EventIdColumn(EventIdColumn column, IAliasedSet set) : base(column, set)
        {
            if (column.InnerColumn is AutoAliasedColumn aliased)
            {
                InnerColumn = new AutoAliasedColumn(aliased.Name, aliased.AliasMarker, set);
                return;
            }
            if (column.InnerColumn is ExpressedColumn exprs)
            {
                InnerColumn = new Column(exprs.Name, set);
            }
        }

        public override string ToString()
        {
            return InnerColumn.ToString();
        }
    }
}
