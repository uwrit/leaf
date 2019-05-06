// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using Model.Tagging;

namespace Services.Search
{
    class ConceptPreflightCheckResultRecord
    {
        public Guid? Id { get; set; }
        public string UniversalId { get; set; }
        public bool IsPresent { get; set; }
        public bool IsAuthorized { get; set; }

        public ConceptPreflightCheckResultRecord()
        {

        }

        public ConceptPreflightCheckResultRecord(ConceptPreflightCheckResult result)
        {
            Id = result.Id;
            UniversalId = result.UniversalId?.ToString();
            IsPresent = result.IsPresent;
            IsAuthorized = result.IsAuthorized;
        }

        public ConceptPreflightCheckResult ConceptPreflightCheckResult()
        {
            ConceptUrn.TryParse(UniversalId, out var urn);
            return new ConceptPreflightCheckResult
            {
                Id = Id,
                UniversalId = urn,
                IsPresent = IsPresent,
                IsAuthorized = IsAuthorized
            };
        }
    }
}
