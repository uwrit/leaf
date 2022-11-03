// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data.Common;
using Model.Schema;

namespace Model.Compiler
{
    public abstract class BaseSchemaField : IEquatable<BaseSchemaField>
    {
        public string Name { get; set; }
        public LeafType Type { get; set; }

        public virtual bool Equals(BaseSchemaField other)
        {
            if (Name == null) return false;
            return Name.Equals(other.Name, StringComparison.InvariantCultureIgnoreCase);
        }

        public virtual bool Matches(BaseSchemaField other)
        {
            if (Type == LeafType.None) return false;
            return Type == other.Type;
        }
    }

    public sealed class SchemaField : BaseSchemaField
    {
        public int Index { get; set; }

        public SchemaField()
        {

        }

        public SchemaField(FieldAttribute fieldAttribute, int index)
        {
            Name = fieldAttribute.Name;
            Type = fieldAttribute.Type;
            Index = index;
        }

        public SchemaField(DbColumn dbColumn)
        {
            Name = dbColumn.ColumnName;
            Type = dbColumn.LeafDataType();
            Index = dbColumn.ColumnOrdinal.Value;
        }
    }

    public sealed class SchemaFieldSelector : BaseSchemaField
    {
        public bool Phi { get; set; }
        public bool Mask { get; set; }
        public bool Required { get; set; }

        public SchemaFieldSelector()
        {

        }

        public SchemaFieldSelector(FieldAttribute fieldAttribute)
        {
            Name = fieldAttribute.Name;
            Type = fieldAttribute.Type;
            Phi = fieldAttribute.Phi;
            Mask = fieldAttribute.Mask;
            Required = fieldAttribute.Required;
        }
    }
}
