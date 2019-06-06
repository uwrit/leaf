// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Tagging;
using System.Collections.Generic;
using Model.Extensions;

namespace Model.Compiler
{
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

    public class DatasetQuery : DatasetQueryRef
    {
        public string Name { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
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
