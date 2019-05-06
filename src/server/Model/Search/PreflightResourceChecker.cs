// Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
        readonly IPreflightResourceReader reader;
        readonly ILogger<PreflightResourceChecker> log;
        readonly IUserContext user;

        public PreflightResourceChecker(
            IPreflightResourceReader reader,
            IUserContext user,
            ILogger<PreflightResourceChecker> log)
        {
            this.reader = reader;
            this.user = user;
            this.log = log;
        }

        /// <summary>
        /// Preflight checks a single concept.
        /// </summary>
        /// <returns>Preflight check results, which contains the actual concepts if the check passed.</returns>
        /// <param name="cr">Concept reference.</param>
        public async Task<PreflightConcepts> GetConceptsAsync(ConceptRef cr)
        {
            log.LogInformation("Getting preflight concept check. Ref:{@Ref}", cr);
            if (user.IsInstutional)
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
        public async Task<PreflightConcepts> GetConceptsAsync(HashSet<ConceptRef> crs)
        {
            log.LogInformation("Getting preflight check concepts. Refs:{@Refs}", crs);
            if (user.IsInstutional)
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
        public async Task<PreflightResources> GetResourcesAsync(ResourceRefs refs)
        {
            log.LogInformation("Getting preflight resource check. Refs:{@Refs}", refs);
            if (user.IsInstutional)
            {
                return await reader.GetResourcesByIdsAsync(refs);
            }
            return await reader.GetResourcesByUniversalIdsAsync(refs);
        }
    }
}
