// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Admin;
using Model.Admin.Compiler;

namespace API.DTO.Admin.Compiler
{
    public class ConceptSqlSetDeleteResponse
    {
        public int ConceptCount { get; set; }
        public IEnumerable<ConceptDependent> Concepts { get; set; }

        public int SpecializationGroupCount { get; set; }
        public IEnumerable<SpecializationGroupDependent> SpecializationGroups { get; set; }

        public static ConceptSqlSetDeleteResponse From(ConceptSqlSetDeleteResult result)
        {
            return new ConceptSqlSetDeleteResponse
            {
                ConceptCount = result.ConceptDependents?.Count() ?? 0,
                Concepts = result.ConceptDependents?.Take(10),
                SpecializationGroupCount = result.SpecializationGroupDependents?.Count() ?? 0,
                SpecializationGroups = result.SpecializationGroupDependents?.Take(10)
            };
        }
    }
}
