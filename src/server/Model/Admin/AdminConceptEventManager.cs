// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Admin;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Options;
using System.Data.Common;
using Model.Error;
using Model.Validation;
using System.Runtime.CompilerServices;

namespace Model.Admin
{
    /// <summary>
    /// Encapsulates administrative workflows for managing <see cref="ConceptEvent"/> data.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class AdminConceptEventManager
    {
        public interface IAdminConceptEventService
        {
            Task<IEnumerable<ConceptEvent>> GetAsync();
            Task<ConceptEvent> UpdateAsync(ConceptEvent spec);
            Task<ConceptEvent> CreateAsync(ConceptEvent spec);
            Task<ConceptEventDeleteResult> DeleteAsync(int id);
        }

        readonly ILogger<AdminConceptEventManager> log;
        readonly IAdminConceptEventService svc;

        public AdminConceptEventManager(
            ILogger<AdminConceptEventManager> log,
            IAdminConceptEventService svc)
        {
            this.log = log;
            this.svc = svc;
        }

        /// <summary>
        /// Creates a new <see cref="ConceptEvent"/>.
        /// </summary>
        /// <returns>Created <see cref="ConceptEvent"/>.</returns>
        /// <param name="ev"><see cref="ConceptEvent"/>.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<ConceptEvent> CreateAsync(ConceptEvent ev)
        {
            ThrowIfMissing(ev);

            try
            {
                var created = await svc.CreateAsync(ev);
                log.LogInformation("Created ConceptEvent:{@ConceptEvent}", created);
                return created;
            }
            catch (DbException de)
            {
                log.LogError("Failed to create ConceptEvent:{@ConceptEvent}. Code:{Code} Error:{Error}", ev, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        /// <summary>
        /// Delete a <see cref="ConceptEvent"/> by Id.
        /// </summary>
        /// <returns>The result, which should be checked.</returns>
        /// <param name="id"><see cref="ConceptEvent.Id"/>.</param>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<ConceptEventDeleteResult> DeleteAsync(int id)
        {
            try
            {
                var result = await svc.DeleteAsync(id);
                if (result.Ok)
                {
                    log.LogInformation("Deleted ConceptEvent. Id:{Id}", id);
                }
                else
                {
                    log.LogInformation("Could not delete ConceptEvent due to conflicts. Id:{Id}", id);
                }
                return result;
            }
            catch (DbException de)
            {
                log.LogError("Failed to delete ConceptEvent. Id:{Id} Code:{Code} Error:{Error}", id, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        /// <summary>
        /// Gets all <see cref="ConceptEvent"/>.
        /// </summary>
        /// <returns><see cref="IEnumerable{ConceptEvent}"/>.</returns>
        /// <exception cref="DbException"/>
        public async Task<IEnumerable<ConceptEvent>> GetAsync()
        {
            log.LogInformation("Getting all ConceptEvents");
            return await svc.GetAsync();
        }

        /// <summary>
        /// Updates the <see cref="ConceptEvent"/>.
        /// </summary>
        /// <returns>Updated <see cref="ConceptEvent"/>.</returns>
        /// <param name="ev">The new <see cref="ConceptEvent"/> state.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<ConceptEvent> UpdateAsync(ConceptEvent ev)
        {
            ThrowIfMissing(ev);

            try
            {
                var updated = await svc.UpdateAsync(ev);
                if (updated != null)
                {
                    log.LogInformation("Updated ConceptEvent:{@ConceptEvent}", updated);
                }
                else
                {
                    log.LogInformation("Could not update ConceptEvent:{@ConceptEvent}, not found", ev);
                }
                return updated;
            }
            catch (DbException de)
            {
                log.LogInformation("Failed to update ConceptEvent. ConceptEvent:{@ConceptEvent} Code:{Code} Error:{Error}", ev, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        void ThrowIfMissing(ConceptEvent ev)
        {
            Ensure.NotNull(ev, nameof(ev));
            Ensure.NotNullOrWhitespace(ev.UiDisplayEventName, nameof(ev.UiDisplayEventName));
        }
    }
}
