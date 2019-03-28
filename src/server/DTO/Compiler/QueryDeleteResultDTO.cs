// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;

using Model.Compiler;
namespace DTO.Compiler
{
    public class QueryDeleteResultDTO
    {
        public bool Ok => Dependents == null || !Dependents.Any();
        public IEnumerable<QueryDependentDTO> Dependents { get; set; }

        public static QueryDeleteResultDTO From(IEnumerable<QueryDependentDTO> dependents)
        {
            return new QueryDeleteResultDTO { Dependents = dependents };
        }

        public static QueryDeleteResultDTO From(IEnumerable<QueryDependent> dependents)
        {
            return new QueryDeleteResultDTO { Dependents = dependents.Select(d => new QueryDependentDTO(d)) };
        }
    }

    public class QueryDependentDTO
    {
        public Guid Id { get; set; }
        public string UniversalId { get; set; }
        public string Name { get; set; }
        public string Owner { get; set; }

        public QueryDependentDTO() { }

        public QueryDependentDTO(Guid id, string urn, string name, string owner)
        {
            Id = id;
            UniversalId = urn;
            Name = name;
            Owner = owner;
        }

        public QueryDependentDTO(QueryDependent dep)
        {
            Id = dep.Id.Value;
            UniversalId = dep.UniversalId?.ToString();
            Name = dep.Name;
            Owner = dep.Owner;
        }
    }
}
