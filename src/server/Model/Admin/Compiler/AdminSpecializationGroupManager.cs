// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Model.Error;
using Model.Validation;

namespace Model.Admin.Compiler
{
    /// <summary>
    /// Encapsulates administrative workflows for managing <see cref="SpecializationGroup"/> data.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class AdminSpecializationGroupManager
    {
        public interface IAdminSpecializationGroupService
        {
            Task<IEnumerable<SpecializationGroup>> GetAsync();
            Task<SpecializationGroup> UpdateAsync(SpecializationGroup spec);
            Task<SpecializationGroup> CreateAsync(SpecializationGroup spec);
            Task<SpecializationGroupDeleteResult> DeleteAsync(int id);
        }

        readonly ILogger<AdminSpecializationGroupManager> log;
        readonly IAdminSpecializationGroupService svc;

        public AdminSpecializationGroupManager(
            ILogger<AdminSpecializationGroupManager> log,
            IAdminSpecializationGroupService svc)
        {
            this.log = log;
            this.svc = svc;
        }

        /// <summary>
        /// Creates a new <see cref="SpecializationGroup"/>.
        /// </summary>
        /// <returns>Created <see cref="SpecializationGroup"/>.</returns>
        /// <param name="g">New <see cref="SpecializationGroup"/>.</param>
        public async Task<SpecializationGroup> CreateAsync(SpecializationGroup g)
        {
            ThrowIfInvalid(g);
            if (g.Specializations?.Any(s => string.IsNullOrWhiteSpace(s.SqlSetWhere) || string.IsNullOrWhiteSpace(s.UiDisplayText)) ?? false)
            {
                throw new ArgumentException($"{nameof(SpecializationGroup)}.{nameof(SpecializationGroup.Specializations)} contains malfored specializations.");
            }

            try
            {
                var created = await svc.CreateAsync(g);
                log.LogInformation("Created SpecializationGroup:{@SpecializationGroup}", created);
                return created;
            }
            catch (DbException de)
            {
                log.LogError("Failed to create SpecializationGroup. SpecializationGroup:{@SpecializationGroup} Code:{Code} Error:{Error}", g, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        /// <summary>
        /// Delete a <see cref="SpecializationGroup"/> by Id.
        /// </summary>
        /// <returns>The result, which should be checked.</returns>
        /// <param name="id"><see cref="SpecializationGroup.Id"/>.</param>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<SpecializationGroupDeleteResult> DeleteAsync(int id)
        {
            try
            {
                var result = await svc.DeleteAsync(id);
                if (result.Ok)
                {
                    log.LogInformation("Deleted SpecializationGroup. Id:{Id}", id);
                }
                else
                {
                    log.LogInformation("Could not delete SpecializationGroup due to conflicts. Id:{Id}", id);
                }
                return result;
            }
            catch (DbException de)
            {
                log.LogError("Failed to delete SpecializationGroup. Id:{Id} Code:{Code} Error:{Error}", id, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        /// <summary>
        /// Gets all <see cref="SpecializationGroup"/>.
        /// </summary>
        /// <returns><see cref="IEnumerable{SpecializationGroup}"/>.</returns>
        /// <exception cref="DbException"/>
        public async Task<IEnumerable<SpecializationGroup>> GetAsync()
        {
            log.LogInformation("Getting all SpecializationGroups.");
            return await svc.GetAsync();
        }

        /// <summary>
        /// Updates the <see cref="SpecializationGroup"/>.
        /// </summary>
        /// <returns>Updated <see cref="SpecializationGroup"/>.</returns>
        /// <param name="g">The new <see cref="SpecializationGroup"/> state.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<SpecializationGroup> UpdateAsync(SpecializationGroup g)
        {
            ThrowIfInvalid(g);

            try
            {
                var updated = await svc.UpdateAsync(g);
                if (updated != null)
                {
                    log.LogInformation("Updated SpecializationGroup:{@SpecializationGroup}", updated);
                }
                else
                {
                    log.LogInformation("Could not update SpecializationGroup:{@SpecializationGroup}, not found", g);
                }
                return updated;
            }
            catch (DbException de)
            {
                log.LogInformation("Failed to update SpecializationGroup. SpecializationGroup:{@SpecializationGroup} Code:{Code} Error:{Error}", g, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        void ThrowIfInvalid(SpecializationGroup g)
        {
            Ensure.NotNull(g, nameof(g));
            Ensure.NotNullOrWhitespace(g.UiDefaultText, nameof(g.UiDefaultText));
        }
    }
}
