//// Copyright (c) 2021, UW Medicine Research IT, University of Washington
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
    public class AdminGlobalPanelFilterManager
    {
        public interface IAdminGlobalPanelFilterService
        {
            Task<IEnumerable<AdminGlobalPanelFilter>> GetAsync();
            Task<AdminGlobalPanelFilter> UpdateAsync(AdminGlobalPanelFilter pf);
            Task<AdminGlobalPanelFilter> CreateAsync(AdminGlobalPanelFilter pf);
            Task<int?> DeleteAsync(int id);
        }

        readonly ILogger<AdminGlobalPanelFilterManager> log;
        readonly IAdminGlobalPanelFilterService svc;

        public AdminGlobalPanelFilterManager(
            ILogger<AdminGlobalPanelFilterManager> log,
            IAdminGlobalPanelFilterService svc)
        {
            this.log = log;
            this.svc = svc;
        }

        public async Task<IEnumerable<AdminGlobalPanelFilter>> GetAsync()
        {
            log.LogInformation("Getting all GlobalPanelFilters.");
            return await svc.GetAsync();
        }

        /// <summary>
        /// Creates a new <see cref="AdminGlobalPanelFilter"/>.
        /// </summary>
        /// <returns>Created <see cref="AdminGlobalPanelFilter"/>.</returns>
        /// <param name="pf"><see cref="AdminGlobalPanelFilter"/>.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<AdminGlobalPanelFilter> CreateAsync(AdminGlobalPanelFilter pf)
        {
            ThrowIfInvalid(pf);

            try
            {
                var created = await svc.CreateAsync(pf);
                log.LogInformation("Created GlobalPanelFilter:{@GlobalPanelFilter}", created);
                return created;
            }
            catch (DbException de)
            {
                log.LogError("Failed to create GlobalPanelFilter. GlobalPanelFilter:{@GlobalPanelFilter}. Code:{Code} Error:{Error}", pf, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        /// <summary>
        /// Updates the <see cref="AdminGlobalPanelFilter"/>.
        /// </summary>
        /// <returns>Updated <see cref="AdminGlobalPanelFilter"/>.</returns>
        /// <param name="pf">The new <see cref="AdminGlobalPanelFilter"/> state.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<AdminGlobalPanelFilter> UpdateAsync(AdminGlobalPanelFilter pf)
        {
            ThrowIfInvalid(pf);

            try
            {
                var updated = await svc.UpdateAsync(pf);
                if (updated != null)
                {
                    log.LogInformation("Updated GlobalPanelFilter:{@GlobalPanelFilter}", updated);
                }
                else
                {
                    log.LogInformation("Could not update GlobalPanelFilter:{@GlobalPanelFilter}, not found", pf);
                }
                return updated;
            }
            catch (DbException de)
            {
                log.LogInformation("Failed to update GlobalPanelFilter. GlobalPanelFilter:{@GlobalPanelFilter} Code:{Code} Error:{Error}", pf, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        /// <summary>
        /// Delete a <see cref="AdminGlobalPanelFilter"/> by Id.
        /// </summary>
        /// <returns>The result, which should be checked.</returns>
        /// <param name="id"><see cref="AdminGlobalPanelFilter.Id"/>.</param>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<int?> DeleteAsync(int id)
        {
            Ensure.NotDefault(id, nameof(id));

            var deleted = await svc.DeleteAsync(id);
            if (deleted.HasValue)
            {
                log.LogInformation("Deleted GlobalPanelFilter. Id:{Id}", id);
            }
            else
            {
                log.LogInformation("GlobalPanelFilter not found. Id:{Id}", id);
            }
            return deleted;
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        void ThrowIfInvalid(AdminGlobalPanelFilter panelFilter)
        {
            Ensure.NotNull(panelFilter, nameof(panelFilter.SqlSetId));
        }
    }
}
