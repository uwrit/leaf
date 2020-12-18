// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Model.Compiler;
using Model.Authorization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Validation;
using Model.Error;
using Model.Options;
using Model.Obfuscation;

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
        public interface IPatientCohortService
        {
            Task<PatientCohort> GetPatientCohortAsync(PatientCountQuery query, CancellationToken token);
        }

        public interface ICohortCacheService
        {
            Task<Guid> CreateUnsavedQueryAsync(PatientCohort cohort, IUserContext user);
        }

        readonly PanelConverter converter;
        readonly PanelValidator validator;
        readonly DeidentificationOptions deidentOpts;
        readonly IPatientCohortService counter;
        readonly ICohortCacheService cohortCache;
        readonly IObfuscationService obfuscator;
        readonly IUserContext user;
        readonly ILogger<CohortCounter> log;
        readonly RuntimeMode runtime;

        public CohortCounter(
            IOptions<RuntimeOptions> opts,
            IOptions<DeidentificationOptions> deidentOpts,
            PanelConverter converter,
            PanelValidator validator,
            IPatientCohortService counter,
            ICohortCacheService cohortCache,
            IObfuscationService obfuscator,
            IUserContext user,
            ILogger<CohortCounter> log)
        {
            this.runtime = opts.Value.Runtime;
            this.deidentOpts = deidentOpts.Value;
            this.converter = converter;
            this.validator = validator;
            this.counter = counter;
            this.obfuscator = obfuscator;
            this.cohortCache = cohortCache;
            this.user = user;
            this.log = log;
        }

        /// <summary>
        /// Provide a count of patients in the specified query.
        /// </summary>
        /// <returns><see cref="Result">The count of patients in the cohort.</see></returns>
        /// <param name="queryDTO">Abstract query representation.</param>
        /// <param name="token">Cancellation token.</param>
        /// <exception cref="OperationCanceledException"/>
        /// <exception cref="LeafCompilerException"/>
        /// <exception cref="ArgumentNullException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="System.Data.Common.DbException"/>
        public async Task<Result> Count(IPatientCountQueryDTO queryDTO, CancellationToken token)
        {
            switch (runtime)
            {
                case RuntimeMode.Gateway:
                    return await GatewayCount(queryDTO, token);
                default:
                    return await FullCount(queryDTO, token);
            }
        }

        /// <summary>
        /// Provide an zero count of patients in the specified query.
        /// Converts the query into a local validation context.
        /// Validates the resulting context to ensure sensible construction.
        /// Creates a queryId and empty cohort.
        /// </summary>
        /// <returns><see cref="Result">The count of patients in the cohort.</see></returns>
        /// <param name="queryDTO">Abstract query representation.</param>
        /// <param name="token">Cancellation token.</param>
        /// <exception cref="OperationCanceledException"/>
        /// <exception cref="LeafCompilerException"/>
        /// <exception cref="ArgumentNullException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="System.Data.Common.DbException"/>
        async Task<Result> GatewayCount(IPatientCountQueryDTO queryDTO, CancellationToken token)
        {
            log.LogInformation("GatewayCount starting. DTO:{@DTO}", queryDTO);
            Ensure.NotNull(queryDTO, nameof(queryDTO));

            var ctx = await converter.GetPanelsAsync(queryDTO, token);
            log.LogInformation("GatewayCount panel validation context. Context:{@Context}", ctx);

            if (!ctx.PreflightPassed)
            {
                return new Result
                {
                    ValidationContext = ctx
                };
            }

            validator.Validate(ctx);

            token.ThrowIfCancellationRequested();

            var cohort = new PatientCohort();
            var qid = await CacheCohort(cohort);

            return new Result
            {
                ValidationContext = ctx,
                Count = new PatientCount
                {
                    QueryId = qid,
                    Value = cohort.Count,
                    PlusMinus = 0,
                    SqlStatements = cohort.SqlStatements
                }
            };
        }

        /// <summary>
        /// Provide a count of patients in the specified query.
        /// Converts the query into a local validation context.
        /// Validates the resulting context to ensure sensible construction.
        /// Obtains the cohort of unique patient IDs.
        /// Caches those patient IDs.
        /// </summary>
        /// <returns><see cref="Result">The count of patients in the cohort.</see></returns>
        /// <param name="queryDTO">Abstract query representation.</param>
        /// <param name="token">Cancellation token.</param>
        /// <exception cref="OperationCanceledException"/>
        /// <exception cref="LeafCompilerException"/>
        /// <exception cref="ArgumentNullException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="System.Data.Common.DbException"/>
        async Task<Result> FullCount(IPatientCountQueryDTO queryDTO, CancellationToken token)
        {
            log.LogInformation("FullCount starting. DTO:{@DTO}", queryDTO);
            Ensure.NotNull(queryDTO, nameof(queryDTO));

            var ctx = await converter.GetPanelsAsync(queryDTO, token);
            log.LogInformation("FullCount panel validation context. Context:{@Context}", ctx);

            if (!ctx.PreflightPassed)
            {
                return new Result
                {
                    ValidationContext = ctx
                };
            }

            var query = validator.Validate(ctx);

            log.LogInformation("FullCount cohort started.");
            var cohort = await counter.GetPatientCohortAsync(query, token);
            log.LogInformation("FullCount cohort retrieved. Cohort:{@Cohort}", new { cohort.Count, cohort.SqlStatements });

            token.ThrowIfCancellationRequested();

            var qid = await CacheCohort(cohort);
            var result = new Result
            {
                ValidationContext = ctx,
                Count = new PatientCount
                {
                    QueryId = qid,
                    Value = cohort.Count,
                    SqlStatements = cohort.SqlStatements
                }
            };

            if (deidentOpts.ObfuscateCohort)
            {
                var count = result.Count;
                obfuscator.Obfuscate(ref count, result.ValidationContext, deidentOpts);
                log.LogInformation("FullCount results obfuscated. Obfuscated:{@Result}", result);
            }

            return result;
        }

        async Task<Guid> CacheCohort(PatientCohort cohort)
        {
            try
            {
                log.LogInformation("Cohort caching started.");
                var qid = await cohortCache.CreateUnsavedQueryAsync(cohort, user);
                log.LogInformation("Cohort caching complete. QueryId:{@QueryId}, Panels:{@Panels}", qid, cohort.Panels.ToArray());
                return qid;
            }
            catch (InvalidOperationException ie)
            {
                log.LogError("Failed to cache cohort. Error:{Error}", ie.Message);
                throw new LeafRPCException(LeafErrorCode.Internal, ie.Message, ie);
            }
        }

        public class Result
        {
            public PanelValidationContext ValidationContext { get; internal set; }
            public PatientCount Count { get; internal set; }
        }
    }
}