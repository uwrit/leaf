// Copyright (c) 2021, UW Medicine Research IT, University of Washington
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
    public class PanelDatasetCompilerValidationContextProvider
    {
        public interface ICompilerContextProvider
        {
            Task<PanelDatasetCompilerContext> GetCompilerContextAsync(QueryRef queryRef, int panelIdx);
        }

        readonly ICompilerContextProvider contextProvider;
        readonly ILogger<PanelDatasetCompilerValidationContextProvider> log;

        public PanelDatasetCompilerValidationContextProvider(
            ICompilerContextProvider contextProvider,
            ILogger<PanelDatasetCompilerValidationContextProvider> log)
        {
            this.contextProvider = contextProvider;
            this.log = log;
        }

        public async Task<CompilerValidationContext<PanelDatasetCompilerContext>> GetCompilerContextAsync(QueryRef qr, int panelIdx)
        {
            log.LogInformation("Getting ConceptDatasetCompilerContext. PanelIndex:{@PanelIndex}, QueryRef:{@QueryRef}", panelIdx, qr);
            try
            {
                var context = await contextProvider.GetCompilerContextAsync(qr, panelIdx);
                var state = GetContextState(context);
                return new CompilerValidationContext<PanelDatasetCompilerContext>
                {
                    Context = context,
                    State = state
                };
            }
            catch (DbException de)
            {
                log.LogError("Failed to get PanelDatasetCompilerContext. Query:{@QueryRef} Code:{Code} Error:{Error}", qr, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        CompilerContextState GetContextState(PanelDatasetCompilerContext context)
        {
            if (context.Panel == null)
            {
                log.LogError("No panel found Leaf database for PanelDatasetCompilerContext.");
                return CompilerContextState.ConceptNotFound;
            }
            if (!context.QueryContext.Found)
            {
                log.LogWarning("Incomplete PanelDatasetCompilerContext. Context:{@Context}", context);
                return CompilerContextState.QueryNotFound;
            }
            return CompilerContextState.Ok;
        }
    }
}
