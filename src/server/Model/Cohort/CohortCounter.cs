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
using Model.Validation;

namespace Model.Cohort
{
    /// <summary>
    /// Encapsulates Leaf's cohort counting use case.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
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

        /// <summary>
        /// Provide a count of patients in the specified query.
        /// Converts the query into a local validation context.
        /// Validates the resulting context to ensure sensible construction.
        /// Obtains the cohort of unique patient IDs.
        /// Caches those patient IDs.
        /// </summary>
        /// <returns><see cref="CohortCount">The count of patients in the cohort.</see></returns>
        /// <param name="queryDTO">Abstract query representation.</param>
        /// <param name="token">Cancellation token.</param>
        /// <exception cref="OperationCanceledException"/>
        /// <exception cref="InvalidOperationException"/>
        /// <exception cref="ArgumentNullException"/>
        public async Task<CohortCount> Count(IPatientCountQueryDTO queryDTO, CancellationToken token)
        {
            Ensure.NotNull(queryDTO, nameof(queryDTO));

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
