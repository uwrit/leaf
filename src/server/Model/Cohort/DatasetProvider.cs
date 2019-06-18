// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Model.Compiler;
using Model.Error;
using Model.Validation;
using Microsoft.Extensions.Logging;

namespace Model.Cohort
{
    /// <summary>
    /// Encapsulates Leaf's cohort dataset use case.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class DatasetProvider
    {
        public interface IDatasetExecutor
        {
            Task<Dataset> ExecuteDatasetAsync(DatasetExecutionContext context, CancellationToken token);
        }

        readonly DatasetCompilerValidationContextProvider contextProvider;
        readonly IDatasetSqlCompiler compiler;
        readonly IDatasetExecutor executor;
        readonly ILogger<DatasetProvider> log;

        public DatasetProvider(
            DatasetCompilerValidationContextProvider contextProvider,
            IDatasetSqlCompiler compiler,
            IDatasetExecutor datasetService,
            ILogger<DatasetProvider> log)
        {
            this.contextProvider = contextProvider;
            this.compiler = compiler;
            this.executor = datasetService;
            this.log = log;
        }

        /// <summary>
        /// Retrieves the specified dataset for patients in the specified query.
        /// </summary>
        /// <returns>A dataset result, which, if the request was valid, contains the dataset.</returns>
        /// <param name="query">Query reference value.</param>
        /// <param name="datasetQuery">Dataset query reference value.</param>
        /// <param name="cancel">Cancelcellation token.</param>
        /// <param name="early">Early time bound.</param>
        /// <param name="late">Late time bound.</param>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="OperationCanceledException"/>
        /// <exception cref="LeafCompilerException"/>
        /// <exception cref="ArgumentNullException"/>
        /// <exception cref="System.Data.Common.DbException"/>
        public async Task<Result> GetDatasetAsync(QueryRef query, DatasetQueryRef datasetQuery, CancellationToken cancel, long? early = null, long? late = null)
        {
            log.LogInformation("Dataset starting. QueryRef:{QueryRef} DatasetRef:{DatasetRef}", query, datasetQuery);
            Ensure.NotNull(query, nameof(query));
            Ensure.NotNull(datasetQuery, nameof(datasetQuery));

            var request = new DatasetExecutionRequest(query, datasetQuery, early, late);
            var result = new Result();

            log.LogInformation("Dataset execution request. Request:{@Request}", request);
            var validationContext = await contextProvider.GetCompilerContextAsync(request);
            log.LogInformation("Dataset compiler validation context. Context:{@Context}", validationContext);

            result.Context = validationContext;
            if (validationContext.State != CompilerContextState.Ok)
            {
                log.LogError("Dataset compiler context error. State:{State}", validationContext.State);
                return result;
            }

            cancel.ThrowIfCancellationRequested();

            var exeContext = compiler.BuildDatasetSql(validationContext.Context);
            log.LogInformation("Compiled dataset execution context. Context:{@Context}", exeContext);

            var data = await executor.ExecuteDatasetAsync(exeContext, cancel);
            log.LogInformation("Dataset complete. Patients:{Patients} Records:{Records}", data.Results.Keys.Count, data.Results.Sum(d => d.Value.Count()));
            
            result.Dataset = data;

            return result;
        }

        public class Result
        {
            public CompilerValidationContext<DatasetCompilerContext> Context { get; internal set; }
            public Dataset Dataset { get; internal set; }
        }
    }
}
