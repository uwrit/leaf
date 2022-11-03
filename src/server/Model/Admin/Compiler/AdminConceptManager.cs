// Copyright (c) 2021, UW Medicine Research IT, University of Washington
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
    /// Encapsulates administrative workflows for managing <see cref="AdminConcept"/> data.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class AdminConceptManager
    {
        public interface IAdminConceptService
        {
            Task<AdminConcept> GetAsync(Guid id);
            Task<AdminConcept> UpdateAsync(AdminConcept c);
            Task<AdminConcept> CreateAsync(AdminConcept c);
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
        /// Creates a new <see cref="AdminConcept"/>.
        /// </summary>
        /// <returns>Created <see cref="AdminConcept"/>.</returns>
        /// <param name="c"><see cref="AdminConcept"/>.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<AdminConcept> CreateAsync(AdminConcept c)
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
        /// Deletes a <see cref="AdminConcept"/> by Id.
        /// </summary>
        /// <returns>The result, which should be checked.</returns>
        /// <param name="id"><see cref="AdminConcept.Id"/>.</param>
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
        /// Gets all <see cref="AdminConcept"/>.
        /// </summary>
        /// <returns><see cref="IEnumerable{Concept}"/>.</returns>
        /// <exception cref="DbException"/>
        public async Task<AdminConcept> GetAsync(Guid id)
        {
            log.LogInformation("Getting Concept. Id:{Id}", id);
            return await svc.GetAsync(id);
        }

        /// <summary>
        /// Updates the <see cref="AdminConcept"/>.
        /// </summary>
        /// <returns>Updated <see cref="AdminConcept"/>.</returns>
        /// <param name="c">The new <see cref="AdminConcept"/> state.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<AdminConcept> UpdateAsync(AdminConcept c)
        {
            ThrowIfInvalid(c);

            try
            {
                var updated = await svc.UpdateAsync(c);
                log.LogInformation("Updated Concept. Concept:{@Concept}", updated);
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
        void ThrowIfInvalid(AdminConcept c)
        {
            Ensure.NotNull(c, nameof(c));
        }
    }
}
