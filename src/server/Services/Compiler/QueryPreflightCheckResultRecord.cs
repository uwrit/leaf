// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

// TODO(cspital) START HERE WRITE CODE TO MARSHAL THIS TO A MODEL GRAPH

namespace Services.Compiler
{
    public class QueryPreflightCheckResultRecord
    {
        // Query that depends on concept
        public Guid? QueryId { get; set; }
        public string QueryUniversalId { get; set; }
        public int QueryVer { get; set; }

        public bool QueryIsPresent { get; set; }
        public bool QueryIsAuthorized { get; set; }

        // Concept belonging to QueryId
        public Guid? ConceptId { get; set; }
        public string ConceptUniversalId { get; set; }
        public bool ConceptIsPresent { get; set; }
        public bool ConceptIsAuthorized { get; set; }
    }
}
