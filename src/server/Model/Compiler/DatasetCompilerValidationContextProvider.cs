// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Search;
using Microsoft.Extensions.Logging;

namespace Model.Compiler
{
    public class DatasetCompilerValidationContextProvider
    {
        readonly IDatasetCompilerContextProvider contextProvider;
        readonly ILogger<DatasetCompilerValidationContextProvider> log;

        public DatasetCompilerValidationContextProvider(
            IDatasetCompilerContextProvider contextProvider,
            ILogger<DatasetCompilerValidationContextProvider> log)
        {
            this.contextProvider = contextProvider;
            this.log = log;
        }

        public async Task<CompilerValidationContext<DatasetCompilerContext>> GetCompilerContextAsync(DatasetExecutionRequest request)
        {
            log.LogInformation("Getting dataset query compiler context. Request:{@Request}", request);

            var context = await contextProvider.GetCompilerContextAsync(request);
            var state = GetContextState(context);
            return new CompilerValidationContext<DatasetCompilerContext>
            {
                Context = context,
                State = state
            };
        }

        CompilerContextState GetContextState(DatasetCompilerContext context)
        {
            var state = CompilerContextState.Ok;

            if (!context.QueryContext.Found)
            {
                state |= CompilerContextState.QueryNotFound;
            }

            if (context.DatasetQuery == null)
            {
                state |= CompilerContextState.DatasetNotFound;
            }

            if (state != CompilerContextState.Ok)
            {
                log.LogWarning("Incomplete dataset compiler context. Context:{@Context}", context);
                return state;
            }

            if (context.Shape != context.DatasetQuery.Shape)
            {
                log.LogWarning("Dataset does not match requested shape. Context:{@Context}", context);
                return CompilerContextState.DatasetShapeMismatch;
            }

            return state;
        }
    }
}
