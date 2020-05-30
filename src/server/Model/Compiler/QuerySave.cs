// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Tagging;

namespace Model.Compiler
{
    public class QuerySave
    {
        public Guid QueryId { get; set; }
        public QueryUrn UniversalId { get; set; }
        public int Ver { get; set; } = 1;
        public string Name { get; set; }
        public string Category { get; set; }
        public ResourceRefs Resources { get; set; }
        public string Definition { get; set; }
    }

    public class QuerySaveResult : QueryRef
    {
        public int Ver { get; set; }

        public QuerySaveResult(Guid id, QueryUrn urn, int ver) : base(id, urn)
        {
            Ver = ver;
        }
    }

    public interface IQuerySaveDTO : IQueryDefinition
    {
        string UniversalId { get; set; }
        int? Ver { get; set; }
        string Name { get; set; }
        string Category { get; set; }
    }
}
