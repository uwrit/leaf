// Copyright (c) 2022, UW Medicine Research IT, University of Washington
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
    public class ConceptPreflightCheckDTO
    {
        public bool Ok { get; set; }
        public IEnumerable<ConceptPreflightCheckResultDTO> Results { get; set; }

        public ConceptPreflightCheckDTO() { }

        public ConceptPreflightCheckDTO(ConceptPreflightCheck check)
        {
            Ok = check.Ok;
            Results = check.Results.Select(r => new ConceptPreflightCheckResultDTO(r));
        }
    }
}
