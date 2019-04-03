// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Data;
using System.Data.SqlClient;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Model.Options;
using Model.Compiler;
using Model.Cohort;
using Services.Compiler;
using Services.Authorization;
using Services.Extensions;
using Services.Cohort;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Security.Claims;
using Model.Authorization;

namespace Services.Cohort
{
    public abstract class PatientCountService : IPatientCountService
    {
        protected readonly ISqlCompiler compiler;
        protected readonly ICohortCacheService cohortCacheService;
        protected readonly ClinDbOptions clinDbOptions;
        protected readonly ILogger<PatientCountService> log;
        protected readonly IUserContext user;

        protected PatientCountService(
            ISqlCompiler compiler,
            ICohortCacheService cohortCacheService,
            IUserContext userContext,
            IOptions<ClinDbOptions> clinOpts,
            ILogger<PatientCountService> logger)
        {
            this.compiler = compiler;
            this.cohortCacheService = cohortCacheService;
            clinDbOptions = clinOpts.Value;
            log = logger;
            user = userContext;
        }

        public async Task<PatientCount> GetPatientCountAsync(PatientCountQuery query, CancellationToken token)
        {
            token.ThrowIfCancellationRequested();
            log.LogInformation("Patient count query starting");

            var cohort = await GetCohortAsync(query, token);

            token.ThrowIfCancellationRequested();

            log.LogInformation("Caching unsaved cohort");
            var qid = await cohortCacheService.CreateUnsavedQueryAsync(cohort, user);
            log.LogInformation("Cached unsaved cohort QueryId:{QueryId}", qid);

            return new PatientCount
            {
                QueryId = qid,
                Value = cohort.Count,
                SqlStatements = cohort.SqlStatements
            };
        }

        protected abstract Task<PatientCohort> GetCohortAsync(PatientCountQuery query, CancellationToken token);
    }
}
