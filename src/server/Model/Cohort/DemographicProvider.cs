// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Compiler;
using Model.Validation;

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
        readonly ILogger<DemographicProvider> log;

        public DemographicProvider(
            IUserContext user,
            DemographicCompilerValidationContextProvider contextProvider,
            IDemographicSqlCompiler compiler,
            IDemographicsExecutor executor,
            ILogger<DemographicProvider> log)
        {
            this.user = user;
            this.contextProvider = contextProvider;
            this.compiler = compiler;
            this.executor = executor;
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
            Ensure.NotNull(query, nameof(query));
            var result = new Result();

            var validationContext = await contextProvider.GetCompilerContextAsync(query);
            result.Context = validationContext;
            if (validationContext.State != CompilerContextState.Ok)
            {
                return result;
            }

            token.ThrowIfCancellationRequested();

            var exeContext = compiler.BuildDemographicSql(validationContext.Context, user.Anonymize());
            log.LogInformation("Compiled Demographic Execution Context. Context:{@Context}", exeContext);

            var ctx = await executor.ExecuteDemographicsAsync(exeContext, token);
            var stats = new DemographicAggregator(ctx).Aggregate();

            result.Demographics = new Demographic
            {
                Patients = ctx.Exported,
                Statistics = stats
            };

            return result;
        }

        // DemographicProvider associated Result type.
        public class Result
        {
            public CompilerValidationContext<DemographicCompilerContext> Context { get; internal set; }
            public Demographic Demographics { get; internal set; }
        }
    }
}
