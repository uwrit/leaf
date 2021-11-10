// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Compiler;
using System.Linq;

namespace API.DTO.Compiler
{
    public class PreflightCheckDTO
    {
        public ConceptPreflightCheckDTO ConceptPreflight { get; set; }
        public QueryPreflightCheckDTO QueryPreflight { get; set; }

        public PreflightCheckDTO()
        {

        }

        public PreflightCheckDTO(PreflightResources resources)
        {
            ConceptPreflight = new ConceptPreflightCheckDTO(resources.DirectConceptsCheck.PreflightCheck);
            QueryPreflight = new QueryPreflightCheckDTO(resources.DirectQueriesCheck);
        }
    }

    public class QueryPreflightCheckDTO
    {
        public bool Ok { get; set; }
        public IEnumerable<QueryPreflightCheckResultDTO> Results { get; set; }

        public QueryPreflightCheckDTO()
        {

        }

        public QueryPreflightCheckDTO(PreflightQueries queries)
        {
            Ok = queries.Ok;
            Results = queries.Results.Select(r => new QueryPreflightCheckResultDTO(r));
        }
    }

    public class QueryPreflightCheckResultDTO
    {
        public Guid? Id { get; set; }
        public string UniversalId { get; set; }
        public int Ver { get; set; }
        public bool IsPresent { get; set; }
        public bool IsAuthorized { get; set; }

        public ConceptPreflightCheckDTO ConceptPreflight { get; set; }

        public QueryPreflightCheckResultDTO()
        {

        }

        public QueryPreflightCheckResultDTO(QueryPreflightCheckResult result)
        {
            Id = result.QueryRef?.Id;
            UniversalId = result.QueryRef?.UniversalId?.ToString();
            Ver = result.Ver;
            IsPresent = result.IsPresent;
            IsAuthorized = result.IsAuthorized;

            ConceptPreflight = new ConceptPreflightCheckDTO(result.ConceptCheck);
        }
    }
}
