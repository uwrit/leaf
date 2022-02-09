// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Model.Compiler;

namespace Model.Cohort
{
    /// <summary>
    /// Encapsulates Leaf's panel dataset extraction use case.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class PanelDatasetProvider
    {
        readonly DatasetProvider.IDatasetExecutor executor;
        readonly PanelDatasetCompilerValidationContextProvider contextProvider;
        readonly ILogger<PanelDatasetProvider> log;
        readonly IPanelDatasetSqlCompiler sqlCompiler;

        public PanelDatasetProvider(
            PanelDatasetCompilerValidationContextProvider contextProvider,
            DatasetProvider.IDatasetExecutor executor,
            ILogger<PanelDatasetProvider> log,

            IPanelDatasetSqlCompiler sqlCompiler)
        {
            this.contextProvider = contextProvider;
            this.executor = executor;
            this.log = log;
            this.sqlCompiler = sqlCompiler;
        }

        public async Task<Result> GetPanelDatasetAsync(QueryRef queryRef, int panelIdx, CancellationToken cancel)
        {
            log.LogInformation("PanelDataset extraction starting. PanelIndex:{@PanelIndex} Query:{@QueryRef}", queryRef, panelIdx);

            var result = new Result();

            var validationContext = await contextProvider.GetCompilerContextAsync(queryRef, panelIdx);
            log.LogInformation("PanelDataset compiler validation context. Context:{@Context}", validationContext);

            result.Context = validationContext;
            if (validationContext.State != CompilerContextState.Ok)
            {
                log.LogError("PanelDatasetCompilerContext error. State:{State}", validationContext.State);
                return result;
            }
            var exeContext = await sqlCompiler.BuildPanelDatasetSql(validationContext.Context);
            log.LogInformation("Compiled PanelDataset execution context. Context:{@Context}", exeContext);

            var data = await executor.ExecuteDatasetAsync(exeContext, cancel);
            log.LogInformation("PanelDataset complete. Patients:{Patients} Records:{Records}", data.Results.Keys.Count, data.Results.Sum(d => d.Value.Count()));

            result.Dataset = data;

            return result;
        }

        public class Result
        {
            public CompilerValidationContext<PanelDatasetCompilerContext> Context { get; internal set; }
            public Dataset Dataset { get; internal set; }
        }
    }
}
