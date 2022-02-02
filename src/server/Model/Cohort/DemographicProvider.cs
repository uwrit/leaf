// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Compiler;
using Model.Validation;
using Model.Error;
using System.Linq;
using Model.Options;
using Microsoft.Extensions.Options;

namespace Model.Cohort
{
    /// <summary>
    /// Encapsulates Leaf's cohort demographic use case.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class DemographicProvider
    {
        public interface IDemographicsExecutor
        {
            Task<PatientDemographicContext> ExecuteDemographicsAsync(
                DemographicExecutionContext context,
                CancellationToken token);
        }

        readonly DemographicCompilerValidationContextProvider contextProvider;
        readonly IDemographicSqlCompiler compiler;
        readonly IDemographicsExecutor executor;
        readonly IUserContext user;
        readonly ClientOptions clientOpts;
        readonly DeidentificationOptions deidentOpts;
        readonly ILogger<DemographicProvider> log;

        public DemographicProvider (
            IUserContext user,
            DemographicCompilerValidationContextProvider contextProvider,
            IOptions<ClientOptions> clientOpts,
            IOptions<DeidentificationOptions> deidentOpts,
            IDemographicSqlCompiler compiler,
            IDemographicsExecutor executor,
            ILogger<DemographicProvider> log)
        {
            this.user = user;
            this.contextProvider = contextProvider;
            this.compiler = compiler;
            this.executor = executor;
            this.clientOpts = clientOpts.Value;
            this.deidentOpts = deidentOpts.Value;
            this.log = log;
        }

        /// <summary>
        /// Retrieves the demographics for patients in the specified query.
        /// </summary>
        /// <returns>A demographic result, which, if the request was valid, contains the demographics.</returns>
        /// <param name="query">Query reference value.</param>
        /// <param name="token">Cancellation token.</param>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="OperationCanceledException"/>
        /// <exception cref="LeafCompilerException"/>
        /// <exception cref="ArgumentNullException"/>
        /// <exception cref="System.Data.Common.DbException"/>
        public async Task<Result> GetDemographicsAsync(QueryRef query, CancellationToken token)
        {
            log.LogInformation("Demographics starting. QueryRef:{QueryRef}", query);
            Ensure.NotNull(query, nameof(query));
            ThrowIfSettingsInvalid();
            var result = new Result();

            var validationContext = await contextProvider.GetCompilerContextAsync(query);
            log.LogInformation("Demographics compiler validation context. Context:{@Context}", validationContext);

            result.Context = validationContext;
            if (validationContext.State != CompilerContextState.Ok)
            {
                log.LogError("Demographics compiler context error. State:{State}", validationContext.State);
                return result;
            }

            token.ThrowIfCancellationRequested();

            var deidentify = deidentOpts.Patient.Enabled && user.Anonymize();
            var exeContext = await compiler.BuildDemographicSql(validationContext.Context, deidentify);
            log.LogInformation("Compiled demographic execution context. Context:{@Context}", exeContext);

            var ctx = await executor.ExecuteDemographicsAsync(exeContext, token);
            var stats = new DemographicAggregator(ctx).Aggregate();

            log.LogInformation("Demographics complete. Exported:{Exported} Total:{Total}", ctx.Exported.Count(), ctx.Cohort.Count());

            result.Demographics = new Demographic
            {
                Patients = GetDemographicsWithSettings(ctx.Exported),
                Statistics = GetStatisticsWithSettings(stats)
            };

            return result;
        }

        IEnumerable<PatientDemographic> GetDemographicsWithSettings(IEnumerable<PatientDemographic> patients)
        {
            // Patient list is disabled, return null
            if (!clientOpts.PatientList.Enabled) { return null; }

            return patients;
        }

        DemographicStatistics GetStatisticsWithSettings(DemographicStatistics stats)
        {
            // Visualize disabled, return null
            if (!clientOpts.Visualize.Enabled) { return null; }

            return stats;
        }

        void ThrowIfSettingsInvalid()
        {
            if (!clientOpts.PatientList.Enabled && !clientOpts.Visualize.Enabled)
            {
                throw new Exception("Both Visualize and Patient List are disabled");
            }
            if (deidentOpts.Cohort.Noise.Enabled)
            {
                throw new Exception("Demographics cannot be returned if Cohort De-identification Noise is enabled");
            }
            if (deidentOpts.Cohort.LowCellSizeMasking.Enabled)
            {
                throw new Exception("Demographics cannot be returned if Cohort De-identification Low Cell Size Masking is enabled");
            }
        }

        // DemographicProvider associated Result type.
        public class Result
        {
            public CompilerValidationContext<DemographicCompilerContext> Context { get; internal set; }
            public Demographic Demographics { get; internal set; }
        }
    }
}
