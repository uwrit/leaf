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
    /// <summary>
    /// Demographic compiler validation context provider.
    /// </summary>
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

        /// <summary>
        /// Get the <see cref="DemographicCompilerContext"/> from the provider, validates it's state, and wraps it in <see cref="CompilerValidationContext{DemographicCompilerContext}"/>.
        /// </summary>
        /// <returns>The compiler validation context.</returns>
        /// <param name="qr">Query reference.</param>
        /// <exception cref="Validation.LeafRPCException"/>
        /// <exception cref="System.Data.Common.DbException"/>
        public async Task<CompilerValidationContext<DemographicCompilerContext>> GetCompilerContextAsync(QueryRef qr)
        {
            log.LogInformation("Getting DemographicQueryCompilerContext. QueryRef:{@QueryRef}", qr);
            try
            {
                var context = await contextProvider.GetCompilerContextAsync(qr);
                var state = GetContextState(context);
                return new CompilerValidationContext<DemographicCompilerContext>
                {
                    Context = context,
                    State = state
                };
            }
            catch (DbException de)
            {
                log.LogError("Failed to get demographic query context. Query:{@QueryRef} Code:{Code} Error:{Error}", qr, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
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
