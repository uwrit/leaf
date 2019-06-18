// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Tagging;
using Model.Extensions;
using System.Collections.Generic;

namespace Model.Compiler
{
    public class QueryRef
    {
        public Guid? Id { get; set; }
        public QueryUrn UniversalId { get; set; }

        public QueryRef()
        {

        }

        public QueryRef(QueryUrn urn)
        {
            UniversalId = urn;
        }

        public QueryRef(Guid? id, QueryUrn urn)
        {
            Id = id;
            UniversalId = urn;
        }

        public QueryRef(string identifier)
        {
            if (Guid.TryParse(identifier, out var guid))
            {
                Id = guid;
            }
            else if (QueryUrn.TryParse(identifier, out var urn))
            {
                UniversalId = urn;
            }
            else
            {
                throw new FormatException($"Query identifier {identifier} is not a valid Guid or Urn");
            }
        }

        public bool UseUniversalId()
        {
            return UniversalId != null;
        }
    }

    public class QueryRefEqualityComparer : IEqualityComparer<QueryRef>
    {
        public bool Equals(QueryRef x, QueryRef y)
        {
            if (x == null && y == null) return true;
            if (x == null || y == null) return false;
            return GetHashCode(x) == GetHashCode(y);
        }

        public int GetHashCode(QueryRef @ref)
        {
            if (@ref.UseUniversalId())
            {
                return @ref.UniversalId.ToString().GetConsistentHashCode();
            }
            return @ref.Id.Value.GetHashCode();
        }
    }
}
