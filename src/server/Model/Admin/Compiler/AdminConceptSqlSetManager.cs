// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Error;
using Model.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Data.Common;
using Model.Validation;
using System.Runtime.CompilerServices;
using System.Diagnostics;

namespace Model.Admin.Compiler
{
    /// <summary>
    /// Encapsulates administrative workflows for managing <see cref="ConceptSqlSet"/> data.
    /// </summary>
    /// <remarks>
    /// Required services throw exceptions that bubble up.
    /// </remarks>
    public class AdminConceptSqlSetManager
    {
        public interface IAdminConceptSqlSetService
        {
            Task<IEnumerable<ConceptSqlSet>> GetAsync();
            Task<ConceptSqlSet> UpdateAsync(ConceptSqlSet set);
            Task<ConceptSqlSet> CreateAsync(ConceptSqlSet set);
            Task<ConceptSqlSetDeleteResult> DeleteAsync(int id);
        }

        readonly ILogger<AdminConceptSqlSetManager> log;
        readonly IAdminConceptSqlSetService svc;

        public AdminConceptSqlSetManager(
            ILogger<AdminConceptSqlSetManager> log,
            IAdminConceptSqlSetService svc)
        {
            this.log = log;
            this.svc = svc;
        }

        /// <summary>
        /// Create a new <see cref="ConceptSqlSet"/>.
        /// </summary>
        /// <returns>Created <see cref="ConceptSqlSet"/>.</returns>
        /// <param name="set">Set.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<ConceptSqlSet> CreateAsync(ConceptSqlSet set)
        {
            ThrowIfInvalid(set);

            try
            {
                var created = await svc.CreateAsync(set);
                log.LogInformation("Created ConceptSqlSet:{@ConceptSqlSet}", created);
                return created;
            }
            catch (DbException de)
            {
                log.LogError("Failed to create ConceptSqlSet:{@ConceptSqlSet}. Code:{Code} Error:{Error}", set, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        /// <summary>
        /// Delete a <see cref="ConceptSqlSet"/> by Id.
        /// </summary>
        /// <returns>The result, which should be checked.</returns>
        /// <param name="id"><see cref="ConceptSqlSet.Id"/>.</param>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<ConceptSqlSetDeleteResult> DeleteAsync(int id)
        {
            try
            {
                var result = await svc.DeleteAsync(id);
                if (result.Ok)
                {
                    log.LogInformation("Deleted ConceptSqlSet. Id:{Id}", id);
                }
                else
                {
                    log.LogInformation("Could not delete ConceptSqlSet due to conflicts. Id:{Id}", id);
                }
                return result;
            }
            catch (DbException de)
            {
                log.LogError("Failed to delete ConceptSqlSet. Id:{Id} Code:{Code} Error:{Error}", id, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        /// <summary>
        /// Gets all <see cref="ConceptSqlSet"/>.
        /// </summary>
        /// <returns><see cref="IEnumerable{ConceptSqlSet}"/>.</returns>
        /// <exception cref="DbException"/>
        public async Task<IEnumerable<ConceptSqlSet>> GetAsync()
        {
            log.LogInformation("Getting all ConceptSqlSets");
            return await svc.GetAsync();
        }

        /// <summary>
        /// Updates the <see cref="ConceptSqlSet"/>.
        /// </summary>
        /// <returns>Updated <see cref="ConceptSqlSet"/>.</returns>
        /// <param name="set">The new <see cref="ConceptSqlSet"/> state.</param>
        /// <exception cref="ArgumentException"/>
        /// <exception cref="LeafRPCException"/>
        /// <exception cref="DbException"/>
        public async Task<ConceptSqlSet> UpdateAsync(ConceptSqlSet set)
        {
            ThrowIfInvalid(set);

            try
            {
                var updated = await svc.UpdateAsync(set);
                log.LogInformation("Updated ConceptSqlSet:{@ConceptSqlSet}", set);
                return updated;
            }
            catch (DbException de)
            {
                log.LogError("Failed to update ConceptSqlSet:{@ConceptSqlSet}. Code:{Code} Error:{Error}", set, de.ErrorCode, de.Message);
                de.MapThrow();
                throw;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        void ThrowIfInvalid(ConceptSqlSet set)
        {
            Ensure.NotNull(set, nameof(set));
            Ensure.NotNullOrWhitespace(set.SqlSetFrom, nameof(set.SqlSetFrom));
        }
    }
}
