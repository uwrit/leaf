// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Admin;

namespace API.DTO.Admin
{
    public class SpecializationGroupDeleteResponse
    {
        public int ConceptCount { get; set; }
        public IEnumerable<ConceptDependent> Concepts { get; set; }

        public static SpecializationGroupDeleteResponse From(SpecializationGroupDeleteResult result)
        {
            return new SpecializationGroupDeleteResponse
            {
                ConceptCount = result.ConceptDependents?.Count() ?? 0,
                Concepts = result.ConceptDependents?.Take(10)
            };
        }
    }
}
