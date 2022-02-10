// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Anonymization;

namespace Model.Cohort
{
    public interface ICachedCohortFetcher
    {
        public Task<IEnumerable<CachedCohortRecord>> FetchCohortAsync(Guid queryId, bool exportedOnly);
        public Task<CachedCohortRecord> FetchPatientByCohortAsync(Guid queryId, string personId);
    }

    public class CachedCohortRecord : ISalt
    {
        public Guid QueryId { get; set; }
        public string PersonId { get; set; }
        public bool Exported { get; set; }
        public Guid Salt { get; set; }
    }
}
