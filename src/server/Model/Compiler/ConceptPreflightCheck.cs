// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Compiler
{
    public class ConceptPreflightCheck
    {
        public bool Ok => Results.All(r => r.IsPresent && r.IsAuthorized);

        public IEnumerable<ConceptPreflightCheckResult> Results { get; set; }

        public IEnumerable<ConceptPreflightCheckResult> Errors()
        {
            if (Ok)
            {
                return new ConceptPreflightCheckResult[] { };
            }
            return Results.Where(r => !r.IsPresent || !r.IsAuthorized);
        }

        public bool IsPresent => Results.All(r => r.IsPresent);
        public bool IsAuthorized => Results.All(r => r.IsAuthorized);
    }
}
