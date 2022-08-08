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
        protected readonly IPanelSqlCompiler compiler;
        protected readonly ISqlProviderQueryExecutor executor;
        protected readonly ICachedCohortPreparer cohortPreparer;
        protected readonly ClinDbOptions clinDbOptions;
        protected readonly CompilerOptions compilerOpts;
        protected readonly ILogger<PatientCohortService> log;

        protected PatientCohortService(
            IPanelSqlCompiler compiler,
            ISqlProviderQueryExecutor executor,
            ICachedCohortPreparer cohortPreparer,
            IOptions<ClinDbOptions> clinDbOptions,
            IOptions<CompilerOptions> compilerOpts,
            ILogger<PatientCohortService> logger)
        {
            this.compiler = compiler;
            this.executor = executor;
            this.cohortPreparer = cohortPreparer;
            this.clinDbOptions = clinDbOptions.Value;
            this.compilerOpts = compilerOpts.Value;
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
