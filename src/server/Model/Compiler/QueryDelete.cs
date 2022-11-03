// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Tagging;
using Model.Extensions;
using System.Collections.Generic;
using System.Linq;

namespace Model.Compiler
{
    public class QueryDeleteResult
    {
        public bool Ok => Dependents == null || !Dependents.Any();
        public IEnumerable<QueryDependent> Dependents { get; set; }

        public static QueryDeleteResult From(IEnumerable<QueryDependent> dependents)
        {
            return new QueryDeleteResult { Dependents = dependents };
        }
    }

    public class QueryDependent : QueryRef
    {
        public string Name { get; set; }
        public string Owner { get; set; }

        public QueryDependent() { }

        public QueryDependent(Guid id, QueryUrn urn, string name, string owner) : base(id, urn)
        {
            Name = name;
            Owner = owner;
        }
    }
}
