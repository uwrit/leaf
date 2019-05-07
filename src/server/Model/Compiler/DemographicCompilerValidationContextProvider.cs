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
    public class DemographicCompilerValidationContextProvider
    {
        public interface ICompilerContextProvider
        {
            Task<DemographicCompilerContext> GetCompilerContextAsync(QueryRef queryRef);
        }

        readonly ICompilerContextProvider contextProvider;
        readonly ILogger<DemographicCompilerValidationContextProvider> log;

        public DemographicCompilerValidationContextProvider(
            ICompilerContextProvider contextProvider,
            ILogger<DemographicCompilerValidationContextProvider> log)
        {
            this.contextProvider = contextProvider;
            this.log = log;
        }

        public async Task<CompilerValidationContext<DemographicCompilerContext>> GetCompilerContextAsync(QueryRef qr)
        {
            log.LogInformation("Getting DemographicQueryCompilerContext. QueryRef:{@QueryRef}", qr);

            var context = await contextProvider.GetCompilerContextAsync(qr);
            var state = GetContextState(context);
            return new CompilerValidationContext<DemographicCompilerContext>
            {
                Context = context,
                State = state
            };
        }

        CompilerContextState GetContextState(DemographicCompilerContext context)
        {
            if (string.IsNullOrWhiteSpace(context.DemographicQuery?.SqlStatement))
            {
                log.LogError("No demographic query configured in Leaf database.");
                return CompilerContextState.DatasetNotFound;
            }
            if (!context.QueryContext.Found)
            {
                log.LogWarning("Incomplete demographic compiler context. Context:{@Context}", context);
                return CompilerContextState.QueryNotFound;
            }
            return CompilerContextState.Ok;
        }
    }
}
