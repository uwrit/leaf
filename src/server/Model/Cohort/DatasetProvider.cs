// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using Model.Compiler;
using Model.Search;
using Model.Validation;

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
        readonly IDatasetQueryService queryService;
        readonly IDatasetService datasetService;

        public DatasetProvider(IDatasetQueryService queryService,
            IDatasetService datasetService)
        {
            this.queryService = queryService;
            this.datasetService = datasetService;
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
        /// <exception cref="LeafPreflightException"/>
        /// <exception cref="LeafDbException"/>
        /// <exception cref="OperationCanceledException"/>
        /// <exception cref="LeafCompilerException"/>
        /// <exception cref="ArgumentNullException"/>
        public async Task<Result> Dataset(QueryRef query, DatasetQueryRef datasetQuery, CancellationToken cancel, long? early = null, long? late = null)
        {
            Ensure.NotNull(query, nameof(query));
            Ensure.NotNull(datasetQuery, nameof(datasetQuery));

            var request = new DatasetExecutionRequest(query, datasetQuery, early, late);
            var result = new Result();

            var ctx = await queryService.GetQueryCompilerContext(request);
            result.Context = ctx;

            if (ctx.State != CompilerContextState.Ok)
            {
                return result;
            }

            cancel.ThrowIfCancellationRequested();

            var data = await datasetService.GetDatasetAsync(ctx.Context, cancel);
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
