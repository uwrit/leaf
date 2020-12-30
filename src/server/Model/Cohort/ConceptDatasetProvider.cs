// Copyright (c) 2020, UW Medicine Research IT, University of Washington
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
    /// Encapsulates Leaf's concept dataset extraction use case.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class ConceptDatasetProvider
    {
        readonly DatasetProvider.IDatasetExecutor executor;
        readonly ConceptDatasetCompilerValidationContextProvider contextProvider;
        readonly ILogger<ConceptDatasetProvider> log;
        readonly IConceptDatasetSqlCompiler conceptDatasetSqlCompiler;

        public ConceptDatasetProvider(
            ConceptDatasetCompilerValidationContextProvider contextProvider,
            DatasetProvider.IDatasetExecutor executor,
            ILogger<ConceptDatasetProvider> log,

            IConceptDatasetSqlCompiler conceptDatasetSqlCompiler)
        {
            this.contextProvider = contextProvider;
            this.executor = executor;
            this.log = log;
            this.conceptDatasetSqlCompiler = conceptDatasetSqlCompiler;
        }

        public async Task<Result> GetConceptDatasetAsync(QueryRef queryRef, ConceptRef conceptRef, CancellationToken cancel)
        {
            log.LogInformation("ConceptDataset extraction starting. ConceptRef:{@ConceptRef} Query:{@QueryRef}", queryRef, conceptRef);

            var result = new Result();

            var validationContext = await contextProvider.GetCompilerContextAsync(queryRef, conceptRef);
            log.LogInformation("ConceptDataset compiler validation context. Context:{@Context}", validationContext);

            result.Context = validationContext;
            if (validationContext.State != CompilerContextState.Ok)
            {
                log.LogError("ConceptDatasetCompilerContext error. State:{State}", validationContext.State);
                return result;
            }
            var exeContext = conceptDatasetSqlCompiler.BuildConceptDatasetSql(validationContext.Context);
            log.LogInformation("Compiled ConceptDataset execution context. Context:{@Context}", exeContext);

            var data = await executor.ExecuteDatasetAsync(exeContext, cancel);
            log.LogInformation("ConceptDataset complete. Patients:{Patients} Records:{Records}", data.Results.Keys.Count, data.Results.Sum(d => d.Value.Count()));

            result.Dataset = data;

            return result;
        }

        public class Result
        {
            public CompilerValidationContext<ConceptDatasetCompilerContext> Context { get; internal set; }
            public Dataset Dataset { get; internal set; }
        }
    }
}
