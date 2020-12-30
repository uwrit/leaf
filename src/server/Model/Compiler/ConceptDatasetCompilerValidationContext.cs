// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Model.Error;
using System.Data.Common;

namespace Model.Compiler
{
    public class ConceptDatasetCompilerValidationContextProvider
    {
        public interface ICompilerContextProvider
        {
            Task<ConceptDatasetCompilerContext> GetCompilerContextAsync(QueryRef queryRef, ConceptRef conceptRef);
        }

        readonly ICompilerContextProvider contextProvider;
        readonly ILogger<ConceptDatasetCompilerValidationContextProvider> log;

        public ConceptDatasetCompilerValidationContextProvider(
            ICompilerContextProvider contextProvider,
            ILogger<ConceptDatasetCompilerValidationContextProvider> log)
        {
            this.contextProvider = contextProvider;
            this.log = log;
        }

        public async Task<CompilerValidationContext<ConceptDatasetCompilerContext>> GetCompilerContextAsync(QueryRef qr, ConceptRef conceptRef)
        {
            log.LogInformation("Getting ConceptDatasetCompilerContext. ConceptRef:{@ConceptRef}, QueryRef:{@QueryRef}", conceptRef, qr);
            try
            {
                var context = await contextProvider.GetCompilerContextAsync(qr, conceptRef);
                var state = GetContextState(context);
                return new CompilerValidationContext<ConceptDatasetCompilerContext>
                {
                    Context = context,
                    State = state
                };
            }
            catch (DbException de)
            {
                log.LogError("Failed to get ConceptDatasetCompilerContext. Query:{@QueryRef} Code:{Code} Error:{Error}", qr, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        CompilerContextState GetContextState(ConceptDatasetCompilerContext context)
        {
            if (context.Concept == null)
            {
                log.LogError("No concept found Leaf database for ConceptDatasetCompilerContext.");
                return CompilerContextState.ConceptNotFound;
            }
            if (!context.QueryContext.Found)
            {
                log.LogWarning("Incomplete ConceptDatasetCompilerContext. Context:{@Context}", context);
                return CompilerContextState.QueryNotFound;
            }
            return CompilerContextState.Ok;
        }
    }
}
