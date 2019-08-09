// Copyright(c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Composure;

namespace Model.Compiler.Common
{
    public class AutoAliasedColumn : UnaliasedColumn
    {
        internal string AliasMarker;

        public AutoAliasedColumn(AutoAliasedColumn col, IAliasedSet set) : base(col.Name)
        {
            Name = col.Name;
            AliasMarker = col.AliasMarker;
            Set = set;
        }

        public AutoAliasedColumn(string name, string aliasMarker) : base(name)
        {
            Name = name;
            AliasMarker = aliasMarker;
        }

        public AutoAliasedColumn(string name, string aliasMarker, IAliasedSet set) : base(name, set)
        {
            AliasMarker = aliasMarker;
        }

        public override string ToString()
        {
            return base
                .ToString()
                .Replace(AliasMarker, Set.Alias);
        }
    }
}
