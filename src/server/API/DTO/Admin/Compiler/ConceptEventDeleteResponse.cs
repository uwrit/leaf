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
    public class ConceptEventDeleteResponse
    {
        public int ConceptSqlSetCount { get; set; }
        public IEnumerable<ConceptSqlSetDependent> ConceptSqlSets { get; set; }

        public static ConceptEventDeleteResponse From(ConceptEventDeleteResult result)
        {
            return new ConceptEventDeleteResponse
            {
                ConceptSqlSetCount = result.ConceptSqlSetDependents?.Count() ?? 0,
                ConceptSqlSets = result.ConceptSqlSetDependents?.Take(10)
            };
        }
    }

    
}
