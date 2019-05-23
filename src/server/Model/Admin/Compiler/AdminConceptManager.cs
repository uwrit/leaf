// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Model.Error;
using Model.Validation;

namespace Model.Admin.Compiler
{
    /// <summary>
    /// Encapsulates administrative workflows for managing <see cref="Concept"/> data.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class AdminConceptManager
    {
        public interface IAdminConceptService
        {
            Task<Concept> GetAsync(Guid id);
            Task<Concept> UpdateAsync(Concept c);
            Task<Concept> CreateAsync(Concept c);
            Task<ConceptDeleteResult> DeleteAsync(Guid id);
        }

        readonly ILogger<AdminConceptManager> log;
        readonly IAdminConceptService svc;

        public AdminConceptManager(
            ILogger<AdminConceptManager> log,
            IAdminConceptService svc)
        {
            this.log = log;
            this.svc = svc;
        }

        /// <summary>
        /// Creates a new <see cref="Concept"/>.
        /// </summary>
        /// <returns>Created <see cref="Concept"/>.</returns>
        /// <param name="c"><see cref="Concept"/>.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<Concept> CreateAsync(Concept c)
        {
            ThrowIfInvalid(c);

            try
            {
                var created = await svc.CreateAsync(c);
                log.LogInformation("Created Concept. Concept:{@Concept}", created);
                return created;
            }
            catch (DbException de)
            {
                log.LogError("Failed to create concept. Concept:{@Concept} Code:{Code} Error:{Error}", c, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        /// <summary>
        /// Deletes a <see cref="Concept"/> by Id.
        /// </summary>
        /// <returns>The result, which should be checked.</returns>
        /// <param name="id"><see cref="Concept.Id"/>.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="DbException"/>
        public async Task<ConceptDeleteResult> DeleteAsync(Guid id)
        {
            try
            {
                var result = await svc.DeleteAsync(id);
                if (result.Ok)
                {
                    log.LogInformation("Deleted Concept. Id:{Id}", id);
                }
                else
                {
                    log.LogInformation("Could not delete Concept due to conflicts. Id:{Id}", id);
                }
                return result;
            }
            catch (DbException de)
            {
                log.LogError("Failed to delete concept. Id:{Id} Code:{Code} Error:{Error}", id, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        /// <summary>
        /// Gets all <see cref="Concept"/>.
        /// </summary>
        /// <returns><see cref="IEnumerable{Concept}"/>.</returns>
        /// <exception cref="DbException"/>
        public async Task<Concept> GetAsync(Guid id)
        {
            log.LogInformation("Getting Concept. Id:{Id}", id);
            return await svc.GetAsync(id);
        }

        /// <summary>
        /// Updates the <see cref="Concept"/>.
        /// </summary>
        /// <returns>Updated <see cref="Concept"/>.</returns>
        /// <param name="c">The new <see cref="Concept"/> state.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<Concept> UpdateAsync(Concept c)
        {
            ThrowIfInvalid(c);

            try
            {
                var updated = await svc.UpdateAsync(c);
                log.LogInformation("Updating Concept. Concept:{@Concept}", updated);
                return updated;
            }
            catch (DbException de)
            {
                log.LogError("Failed to update concept. Concept:{@Concept} Code:{Code} Error:{Error}", c, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        void ThrowIfInvalid(Concept c)
        {
            Ensure.NotNull(c, nameof(c));
        }
    }
}
