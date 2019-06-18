// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data.Common;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Error;
using Microsoft.Extensions.Logging;

namespace Model.Compiler
{
    /// <summary>
    /// Dataset compiler validation context provider.
    /// </summary>
    public class DatasetCompilerValidationContextProvider
    {
        public interface ICompilerContextProvider
        {
            Task<DatasetCompilerContext> GetCompilerContextAsync(DatasetExecutionRequest request);
        }

        readonly ICompilerContextProvider contextProvider;
        readonly ILogger<DatasetCompilerValidationContextProvider> log;

        public DatasetCompilerValidationContextProvider(
            ICompilerContextProvider contextProvider,
            ILogger<DatasetCompilerValidationContextProvider> log)
        {
            this.contextProvider = contextProvider;
            this.log = log;
        }

        /// <summary>
        /// Get the <see cref="DatasetCompilerContext"/> from the provider, validates it's state, and wraps it in <see cref="CompilerValidationContext{DatasetCompilerContext}"/>.
        /// </summary>
        /// <returns>The compiler validation context.</returns>
        /// <param name="request">Execution request.</param>
        /// <exception cref="Validation.LeafRPCException"/>
        /// <exception cref="System.Data.Common.DbException"/>
        public async Task<CompilerValidationContext<DatasetCompilerContext>> GetCompilerContextAsync(DatasetExecutionRequest request)
        {
            log.LogInformation("Getting dataset query compiler context. Request:{@Request}", request);
            try
            {
                var context = await contextProvider.GetCompilerContextAsync(request);
                var state = GetContextState(context);
                return new CompilerValidationContext<DatasetCompilerContext>
                {
                    Context = context,
                    State = state
                };
            }
            catch (DbException de)
            {
                log.LogError("Failed to get dataset query context. Context:{@Context} Code:{Code} Error:{Error}", request, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
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
