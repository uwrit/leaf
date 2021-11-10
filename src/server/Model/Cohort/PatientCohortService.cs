// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Compiler;
using Model.Options;

namespace Model.Cohort
{
    public abstract class PatientCohortService : CohortCounter.IPatientCohortService
    {
        protected readonly ISqlCompiler compiler;
        protected readonly ClinDbOptions clinDbOptions;
        protected readonly ILogger<PatientCohortService> log;

        protected PatientCohortService(
            ISqlCompiler compiler,
            IOptions<ClinDbOptions> clinOpts,
            ILogger<PatientCohortService> logger)
        {
            this.compiler = compiler;
            clinDbOptions = clinOpts.Value;
            log = logger;
        }

        public async Task<PatientCohort> GetPatientCohortAsync(PatientCountQuery query, CancellationToken token)
        {
            token.ThrowIfCancellationRequested();

            var cohort = await GetCohortAsync(query, token);

            return cohort;
        }

        protected abstract Task<PatientCohort> GetCohortAsync(PatientCountQuery query, CancellationToken token);
    }
}
