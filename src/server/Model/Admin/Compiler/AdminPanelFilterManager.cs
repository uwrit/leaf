// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Data.Common;
using System.Runtime.CompilerServices;
using Microsoft.Extensions.Logging;
using Model.Error;
using Model.Validation;

namespace Model.Admin.Compiler
{
    public class AdminPanelFilterManager
    {
        public interface IAdminPanelFilterService
        {
            Task<IEnumerable<AdminPanelFilter>> GetAsync();
            Task<AdminPanelFilter> UpdateAsync(AdminPanelFilter pf);
            Task<AdminPanelFilter> CreateAsync(AdminPanelFilter pf);
            Task<int?> DeleteAsync(int id);
        }

        readonly ILogger<AdminPanelFilterManager> log;
        readonly IAdminPanelFilterService svc;

        public AdminPanelFilterManager(
            ILogger<AdminPanelFilterManager> log,
            IAdminPanelFilterService svc)
        {
            this.log = log;
            this.svc = svc;
        }

        public async Task<IEnumerable<AdminPanelFilter>> GetAsync()
        {
            log.LogInformation("Getting all PanelFilters.");
            return await svc.GetAsync();
        }

        /// <summary>
        /// Creates a new <see cref="AdminPanelFilter"/>.
        /// </summary>
        /// <returns>Created <see cref="AdminPanelFilter"/>.</returns>
        /// <param name="pf"><see cref="AdminPanelFilter"/>.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<AdminPanelFilter> CreateAsync(AdminPanelFilter pf)
        {
            ThrowIfInvalid(pf);

            try
            {
                var created = await svc.CreateAsync(pf);
                log.LogInformation("Created PanelFilter:{@PanelFilter}", created);
                return created;
            }
            catch (DbException de)
            {
                log.LogError("Failed to create PanelFilter. PanelFilter:{@PanelFilter}. Code:{Code} Error:{Error}", pf, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        /// <summary>
        /// Updates the <see cref="AdminPanelFilter"/>.
        /// </summary>
        /// <returns>Updated <see cref="AdminPanelFilter"/>.</returns>
        /// <param name="pf">The new <see cref="AdminPanelFilter"/> state.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<AdminPanelFilter> UpdateAsync(AdminPanelFilter pf)
        {
            ThrowIfInvalid(pf);

            try
            {
                var updated = await svc.UpdateAsync(pf);
                if (updated != null)
                {
                    log.LogInformation("Updated PanelFilter:{@PanelFilter}", updated);
                }
                else
                {
                    log.LogInformation("Could not update PanelFilter:{@PanelFilter}, not found", pf);
                }
                return updated;
            }
            catch (DbException de)
            {
                log.LogInformation("Failed to update PanelFilter. PanelFilter:{@PanelFilter} Code:{Code} Error:{Error}", pf, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        /// <summary>
        /// Delete a <see cref="AdminPanelFilter"/> by Id.
        /// </summary>
        /// <returns>The result, which should be checked.</returns>
        /// <param name="id"><see cref="AdminPanelFilter.Id"/>.</param>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<int?> DeleteAsync(int id)
        {
            Ensure.NotDefault(id, nameof(id));

            var deleted = await svc.DeleteAsync(id);
            if (deleted.HasValue)
            {
                log.LogInformation("Deleted PanelFilter. Id:{Id}", id);
            }
            else
            {
                log.LogInformation("PanelFilter not found. Id:{Id}", id);
            }
            return deleted;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        void ThrowIfInvalid(AdminPanelFilter panelFilter)
        {
            Ensure.NotNull(panelFilter, nameof(panelFilter.ConceptId));
            Ensure.NotNullOrWhitespace(panelFilter.UiDisplayText, nameof(panelFilter.UiDisplayDescription));
        }
    }
}
