// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Logging;
using System.Data.Common;
using Model.Validation;
using Model.Compiler;
using Model.Error;
using System.Runtime.CompilerServices;

namespace Model.Admin.Compiler
{
    public class AdminDemographicsManager
    {
        public interface IAdminDemographicQueryService
        {
            Task<AdminDemographicQuery> GetDemographicQueryAsync();
            Task<AdminDemographicQuery> UpdateDemographicQueryAsync(AdminDemographicQuery query);
        }

        readonly IAdminDemographicQueryService svc;
        readonly ILogger<AdminDemographicsManager> log;

        public AdminDemographicsManager(
            IAdminDemographicQueryService service,
            ILogger<AdminDemographicsManager> log)
        {
            svc = service;
            this.log = log;
        }

        public async Task<AdminDemographicQuery> GetDemographicQueryAsync()
        {
            log.LogInformation("Getting DemographicsQuery.");
            return await svc.GetDemographicQueryAsync();
        }

        public async Task<AdminDemographicQuery> UpdateDemographicQueryAsync(AdminDemographicQuery query)
        {
            ThrowIfInvalid(query);

            try
            {
                var updated = await svc.UpdateDemographicQueryAsync(query);
                log.LogInformation("Updated DemographicsQuery. DemographicsQuery:{@DemographicsQuery}", updated);
                return updated;
            }
            catch (DbException db)
            {
                log.LogError("Failed to update DemographicsQuery. Query:{@Query} Code:{Code} Error:{Error}", query, db.ErrorCode, db.Message);
                db.MapThrow();
                throw;
            }
        }

        [MethodImpl(MethodImplOptions.AggressiveInlining)]
        void ThrowIfInvalid(AdminDemographicQuery query)
        {
            Ensure.NotNull(query, nameof(query));
            Ensure.NotNullOrWhitespace(query.SqlStatement, nameof(query.SqlStatement));
        }
    }
}
