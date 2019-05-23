// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Data.Common;
using Model.Admin;
using Model.Tagging;
using Microsoft.Extensions.Logging;
using Model.Error;
using System.Linq;
using Model.Validation;
using Model.Authorization;
using System.Runtime.CompilerServices;
using System.Diagnostics;

namespace Model.Admin.Compiler
{
    /// <summary>
    /// Encapsulates administrative workflows for managing <see cref="Specialization"/> data.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class AdminSpecializationManager
    {
        public interface IAdminSpecializationService
        {
            Task<IEnumerable<Specialization>> GetByGroupIdAsync(int id);
            Task<Specialization> UpdateAsync(Specialization spec);
            Task<Specialization> CreateAsync(Specialization spec);
            Task<Specialization> DeleteAsync(Guid id);
        }

        readonly ILogger<AdminSpecializationManager> log;
        readonly IAdminSpecializationService svc;

        public AdminSpecializationManager(
            ILogger<AdminSpecializationManager> log,
            IAdminSpecializationService svc)
        {
            this.log = log;
            this.svc = svc;
        }

        /// <summary>
        /// Creates a new <see cref="Specialization"/>.
        /// </summary>
        /// <returns>Created <see cref="Specialization"/>.</returns>
        /// <param name="spec"><see cref="Specialization"/>.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<Specialization> CreateAsync(Specialization spec)
        {
            ThrowIfMissing(spec);

            try
            {
                var created = await svc.CreateAsync(spec);
                log.LogInformation("Created Specialization:{@Specialization}", created);
                return created;
            }
            catch (DbException de)
            {
                log.LogError("Failed to create Specialization. Specialization:{@Specialization} Code:{Code} Error:{Error}", spec, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        /// <summary>
        /// Updates the <see cref="Specialization"/>.
        /// </summary>
        /// <returns>The new <see cref="Specialization"/> state.</returns>
        /// <param name="spec">Spec.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<Specialization> UpdateAsync(Specialization spec)
        {
            ThrowIfMissing(spec);

            try
            {
                var updated = await svc.UpdateAsync(spec);
                log.LogInformation("Update Specialization:{@Specialization}", updated);
                return updated;
            }
            catch (DbException de)
            {
                log.LogError("Failed to update Specialization:{@Specialization}. Code:{Code} Error:{Error}", spec, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        /// <summary>
        /// Deletes a <see cref="Specialization"/> by Id.
        /// </summary>
        /// <returns>The result, which should be checked.</returns>
        /// <param name="id"><see cref="Specialization.Id"/>.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="DbException"/>
        public async Task<Specialization> DeleteAsync(Guid id)
        {
            Ensure.NotDefault(id, nameof(id));

            var deleted = await svc.DeleteAsync(id);
            log.LogInformation("Deleting Specialization. Id:{Id}", id);
            return deleted;
        }

        /// <summary>
        /// Gets all specialization associated with the specified <see cref="SpecializationGroup.Id"/>.
        /// </summary>
        /// <returns><see cref="IEnumerable{Specialization}"/>.</returns>
        /// <param name="id"><see cref="SpecializationGroup.Id"/>.</param>
        public async Task<IEnumerable<Specialization>> GetByGroupIdAsync(int id)
        {
            Ensure.NotDefault(id, nameof(id));
            log.LogInformation("Getting Specializations. GroupId:{GroupId}", id);

            try
            {
                return await svc.GetByGroupIdAsync(id);
            }
            catch (DbException de)
            {
                log.LogError("Failed to fetch Specializations. SpecializationGroupId:{SpecializationGroupId} Code:{Code} Error:{Error}", id, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        void ThrowIfMissing(Specialization spec)
        {
            Ensure.NotNull(spec, nameof(spec));
            Ensure.NotDefault(spec.SpecializationGroupId, nameof(spec.SpecializationGroupId));
            Ensure.NotNullOrWhitespace(spec.UiDisplayText, nameof(spec.UiDisplayText));
            Ensure.NotNullOrWhitespace(spec.SqlSetWhere, nameof(spec.SqlSetWhere));
        }
    }
}
