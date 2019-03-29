// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;

namespace DTO.Compiler
{
    public class BaseQueryDTO
    {
        public Guid Id { get; set; }
        public string UniversalId { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string Owner { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
        public int? Count { get; set; }

        public BaseQueryDTO()
        {

        }

        public BaseQueryDTO(BaseQuery q)
        {
            Id = q.Id;
            UniversalId = q.UniversalId.ToString();
            Name = q.Name;
            Category = q.Category;
            Owner = q.Owner;
            Created = q.Created;
            Updated = q.Updated;
            Count = q.Count;
        }
    }

    public class QueryDTO : BaseQueryDTO
    {
        public string Definition { get; set; }

        public QueryDTO()
        {

        }

        public QueryDTO(Query q) : base(q)
        {
            Definition = q.Definition;
        }
    }
}
