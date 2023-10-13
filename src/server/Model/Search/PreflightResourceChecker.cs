// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Model.Compiler;
using Model.Authorization;
using System.Linq;
using Model.Tagging;

namespace Model.Search
{
    /// <summary>
    /// Encapsulates Leaf's data constraint and hydration layer. Concepts and resources are only available if the preflight check passed.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class PreflightResourceChecker
    {
        public interface IPreflightResourceReader : IPreflightConceptReader
        {
            Task<PreflightResources> GetResourcesByIdsAsync(ResourceRefs refs);
            Task<PreflightResources> GetResourcesByUniversalIdsAsync(ResourceRefs refs);
        }

        public interface IPreflightConceptReader
        {
            Task<PreflightConcepts> GetConceptsByIdAsync(Guid id);
            Task<PreflightConcepts> GetConceptsByUniversalIdAsync(Urn uid);
            Task<PreflightConcepts> GetConceptsByIdsAsync(HashSet<Guid> ids);
            Task<PreflightConcepts> GetConceptsByUniversalIdsAsync(HashSet<string> uids);
        }

        readonly IPreflightResourceReader reader;
        readonly ILogger<PreflightResourceChecker> log;
        readonly IUserContext user;

        public PreflightResourceChecker(
            IPreflightResourceReader reader,
            IUserContextProvider userContextProvider,
            ILogger<PreflightResourceChecker> log)
        {
            this.reader = reader;
            this.user = userContextProvider.GetUserContext(0);
            this.log = log;
        }

        /// <summary>
        /// Preflight checks a single concept.
        /// </summary>
        /// <returns>Preflight check results, which contains the actual concepts if the check passed.</returns>
        /// <param name="cr">Concept reference.</param>
        /// <exception cref="System.Data.Common.DbException"/>
        public async Task<PreflightConcepts> GetConceptsAsync(ConceptRef cr)
        {
            log.LogInformation("Getting preflight concept check. Ref:{@Ref}", cr);
            var pc = await GetConceptsAsyncImpl(cr);
            if (!pc.Ok)
            {
                log.LogError("Preflight concept check failed. Check:{@Check}", pc);
            }
            return pc;
        }

        async Task<PreflightConcepts> GetConceptsAsyncImpl(ConceptRef cr)
        {
            if (user.IsInstitutional)
            {
                return await reader.GetConceptsByIdAsync(cr.Id.Value);
            }
            return await reader.GetConceptsByUniversalIdAsync(cr.UniversalId);
        }

        /// <summary>
        /// Preflight checks concepts.
        /// </summary>
        /// <returns>Preflight check results, which contains the actual concepts if the check passed.</returns>
        /// <param name="crs">Concept references.</param>
        /// <exception cref="System.Data.Common.DbException"/>
        public async Task<PreflightConcepts> GetConceptsAsync(HashSet<ConceptRef> crs)
        {
            log.LogInformation("Getting preflight concepts check. Refs:{@Refs}", crs);
            var pc = await GetConceptsAsyncImpl(crs);
            if (!pc.Ok)
            {
                log.LogError("Preflight concepts check failed. Check:{@Check}", pc);
            }
            return pc;
        }

        async Task<PreflightConcepts> GetConceptsAsyncImpl(HashSet<ConceptRef> crs)
        {
            if (user.IsInstitutional)
            {
                return await reader.GetConceptsByIdsAsync(crs.Select(c => c.Id.Value).ToHashSet());
            }
            return await reader.GetConceptsByUniversalIdsAsync(crs.Select(c => c.UniversalId.ToString()).ToHashSet());
        }

        /// <summary>
        /// Preflight checks resources.
        /// </summary>
        /// <returns>Preflight check results, which contains the actual resources if the check passed.</returns>
        /// <param name="refs">Resource references.</param>
        /// <exception cref="System.Data.Common.DbException"/>
        public async Task<PreflightResources> GetResourcesAsync(ResourceRefs refs)
        {
            log.LogInformation("Getting preflight resources check. Refs:{@Refs}", refs);
            var pr = await GetResourcesAsyncImpl(refs);
            if (!pr.Ok)
            {
                log.LogError("Preflight resources check failed. Check:{@Check}", pr);
            }
            return pr;
        }

        async Task<PreflightResources> GetResourcesAsyncImpl(ResourceRefs refs)
        {
            if (user.IsInstitutional)
            {
                return await reader.GetResourcesByIdsAsync(refs);
            }
            return await reader.GetResourcesByUniversalIdsAsync(refs);
        }
    }
}
