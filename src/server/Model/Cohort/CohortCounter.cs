// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using Model.Compiler;
using Model.Authorization;
using Microsoft.Extensions.Logging;

namespace Model.Cohort
{
    public class CohortCounter
    {
        readonly IPanelConverterService converter;
        readonly IPanelValidator validator;
        readonly IPatientCohortService counter;
        readonly ICohortCacheService cohortCache;
        readonly IUserContext user;
        readonly ILogger<CohortCounter> log;

        public CohortCounter(IPanelConverterService converter,
            IPanelValidator validator,
            IPatientCohortService counter,
            ICohortCacheService cohortCache,
            IUserContext user,
            ILogger<CohortCounter> log)
        {
            this.converter = converter;
            this.validator = validator;
            this.counter = counter;
            this.cohortCache = cohortCache;
            this.user = user;
            this.log = log;
        }

        public async Task<CohortCount> Count(IPatientCountQueryDTO queryDTO, CancellationToken token)
        {
            var ctx = await converter.GetPanelsAsync(queryDTO, token);
            if (!ctx.PreflightPassed)
            {
                return new CohortCount
                {
                    ValidationContext = ctx
                };
            }

            var query = validator.Validate(ctx);
            var cohort = await counter.GetPatientCohortAsync(query, token);

            token.ThrowIfCancellationRequested();

            log.LogInformation("Caching unsaved cohort.");
            var qid = await cohortCache.CreateUnsavedQueryAsync(cohort, user);
            log.LogInformation("Cached unsaved cohort. QueryId:{QueryId}", qid);

            return new CohortCount
            {
                ValidationContext = ctx,
                Count = new PatientCount
                {
                    QueryId = qid,
                    Value = cohort.Count,
                    SqlStatements = cohort.SqlStatements
                }
            };
        }
    }

    public class CohortCount
    {
        public PanelValidationContext ValidationContext { get; internal set; }
        public PatientCount Count { get; internal set; }
    }
}
