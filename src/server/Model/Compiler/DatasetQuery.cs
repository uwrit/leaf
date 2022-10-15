// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Tagging;
using Model.Schema;
using System.Collections.Generic;
using Model.Extensions;

namespace Model.Compiler
{
    public interface IDatasetQuery
    {
        Guid? Id { get; set; }
        Urn UniversalId { get; set; }
        bool IsEncounterBased { get; set; }
        bool IsText { get; set; }
        Shape Shape { get; set; }
        string Name { get; set; }
        string Category { get; set; }
        string Description { get; set; }
        string SqlStatement { get; set; }
        ICollection<string> Tags { get; set; }
    }

    public class DatasetQueryRef
    {
        public Guid? Id { get; set; }
        public Urn UniversalId { get; set; }
        public Shape Shape { get; set; }

        public DatasetQueryRef()
        {

        }

        public DatasetQueryRef(string identifier, Shape shape)
        {
            if (Guid.TryParse(identifier, out var guid))
            {
                Id = guid;
            }
            else if (DatasetQueryUrn.TryParse(identifier, out var urn))
            {
                UniversalId = urn;
            }
            else
            {
                throw new FormatException($"Dataset identifier {identifier} is not a valid Guid or Urn");
            }
            Shape = shape;
        }

        public bool UseUniversalId()
        {
            return UniversalId != null;
        }
    }

    

    public class DatasetQuery : DatasetQueryRef, IDatasetQuery
    {
        public string Name { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public bool IsEncounterBased { get; set; }
        public bool IsText { get; set; }
        public string SqlStatement { get; set; }
        public ICollection<string> Tags { get; set; }

        public DatasetQuery()
        {
            Tags = new List<string>();
        }

        public DatasetQuery(string identifier, Shape shape) : base(identifier, shape)
        {
            Tags = new List<string>();
        }
    }

    public class DynamicDatasetQuery : DatasetQuery, IDatasetQuery
    {
        public string SqlFieldDate { get; set; }
        public string SqlFieldValueString { get; set; }
        public string SqlFieldValueNumeric { get; set; }
        public DynamicDatasetQuerySchema Schema { get; set; }
    }

    public class DynamicDatasetQuerySchema
    {
        public ICollection<DynamicDatasetQuerySchemaFieldRecord> Fields { get; set; }
    }

    public class DynamicDatasetQuerySchemaFieldRecord
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public bool Phi { get; set; }
        public bool Mask { get; set; }
        public bool Required { get; set; }

        public SchemaFieldSelector ToSchemaField()
        {
            return new SchemaFieldSelector
            {
                Name = Name,
                Type = GetLeafType(),
                Phi = Phi,
                Mask = Mask,
                Required = Required
            };
        }

        private LeafType GetLeafType()
        {
            return Type switch
            {
                "String"   => LeafType.String,
                "Bool"     => LeafType.Bool,
                "DateTime" => LeafType.DateTime,
                "Guid"     => LeafType.Guid,
                "Numeric"  => LeafType.Numeric,
                _          => LeafType.String,
            };
        }
    }

    public class DynamicDatasetQuerySchemaField : DynamicDatasetQuerySchemaFieldRecord
    {
        public new LeafType Type { get; set; }
    }

    public class DatasetQueryRefEqualityComparer : IEqualityComparer<DatasetQueryRef>
    {
        public bool Equals(DatasetQueryRef x, DatasetQueryRef y)
        {
            if (x == null && y == null) return true;
            if (x == null || y == null) return false;
            return GetHashCode(x) == GetHashCode(y);
        }

        public int GetHashCode(DatasetQueryRef @ref)
        {
            if (@ref.UseUniversalId())
            {
                return @ref.UniversalId.ToString().GetConsistentHashCode();
            }
            return @ref.Id.Value.GetHashCode();
        }
    }

    public class TagEqualityComparer : IEqualityComparer<string>
    {
        public bool Equals(string x, string y)
        {
            if (x != null)
            {
                return x.Equals(y, StringComparison.InvariantCultureIgnoreCase);
            }
            if (y != null)
            {
                return y.Equals(x, StringComparison.InvariantCultureIgnoreCase);
            }
            return true;
        }

        public int GetHashCode(string obj)
        {
            return obj.GetConsistentHashCode();
        }
    }
}
