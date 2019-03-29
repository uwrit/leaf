// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Compiler
{
    public class PreflightConcepts
    {
        public ConceptPreflightCheck PreflightCheck { get; set; }
        public IEnumerable<Concept> Concepts { get; set; }

        public IEnumerable<ConceptPreflightCheckResult> Errors()
        {
            return PreflightCheck.Errors();
        }

        public bool IsPresent => PreflightCheck.IsPresent;
        public bool IsAuthorized => PreflightCheck.IsAuthorized;
        public bool Ok => PreflightCheck.Ok;
    }
}
