// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Model.Error;
using System.Data.Common;
using System.Linq;

namespace Model.Compiler
{
    public class ConceptDatasetCompilerValidationContextProvider
    {
        public interface ICompilerContextProvider
        {
            Task<PanelDatasetCompilerContext> GetCompilerContextAsync(ConceptDatasetExecutionRequest request);
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

        public async Task<CompilerValidationContext<PanelDatasetCompilerContext>> GetCompilerContextAsync(ConceptDatasetExecutionRequest request)
        {
            log.LogInformation("Getting ConceptDatasetCompilerContext. ConceptDatasetExecutionRequest:{@Request}", request);
            try
            {
                var conceptRef = new ConceptRef(request.PanelItem.Resource);
                var context = await contextProvider.GetCompilerContextAsync(request);
                var state = GetContextState(context);
                return new CompilerValidationContext<PanelDatasetCompilerContext>
                {
                    Context = context,
                    State = state
                };
            }
            catch (DbException de)
            {
                log.LogError("Failed to get ConceptDatasetCompilerContext. Request:{@Request} Code:{Code} Error:{Error}", request, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        CompilerContextState GetContextState(PanelDatasetCompilerContext context)
        {
            if (context.Panel.SubPanels.First().PanelItems.First().Concept == null)
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
