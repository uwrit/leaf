// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;

namespace API.DTO.Compiler
{
    public class QuerySaveResultDTO
    {
        public Guid Id { get; set; }
        public string UniversalId { get; set; }
        public int Ver { get; set; }

        public QuerySaveResultDTO(QuerySaveResult qsr)
        {
            Id = qsr.Id.Value;
            UniversalId = qsr.UniversalId.ToString();
            Ver = qsr.Ver;
        }
    }

    public class QuerySaveResponseDTO
    {
        public PreflightCheckDTO Preflight { get; set; }
        public QuerySaveResultDTO Query { get; set; }
    }
}
