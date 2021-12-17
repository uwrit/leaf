// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Model.Admin;
using Model.Admin.Compiler;

namespace API.DTO.Admin.Compiler
{
    public class ConceptDeleteResponse
    {
        public int PanelFilterCount { get; set; }
        public IEnumerable<PanelFilterDependent> PanelFilters { get; set; }

        public int QueryCount { get; set; }
        public IEnumerable<QueryDependent> Queries { get; set; }

        public int ConceptCount { get; set; }
        public IEnumerable<ConceptDependent> Concepts { get; set; }

        public ConceptDeleteResponse(ConceptDeleteResult r)
        {
            PanelFilterCount = r.PanelFilterDependents?.Count() ?? 0;
            PanelFilters = r.PanelFilterDependents?.Take(10);
            QueryCount = r.QueryDependents?.Count() ?? 0;
            Queries = r.QueryDependents?.Take(10);
            ConceptCount = r.ConceptDependents?.Count() ?? 0;
            Concepts = r.ConceptDependents?.Take(10);
        }
    }
}
