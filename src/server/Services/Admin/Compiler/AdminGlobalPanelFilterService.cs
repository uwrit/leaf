// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Model.Admin.Compiler;
using Model.Options;
using Model.Authorization;
using Dapper;

namespace Services.Admin.Compiler
{
    public class AdminGlobalPanelFilterService : AdminGlobalPanelFilterManager.IAdminGlobalPanelFilterService
    {
        readonly AppDbOptions opts;
        readonly IUserContext user;

        public AdminGlobalPanelFilterService(IOptions<AppDbOptions> opts, IUserContext user)
        {
            this.opts = opts.Value;
            this.user = user;
        }

        public async Task<IEnumerable<AdminGlobalPanelFilter>> GetAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var all = await cn.QueryAsync<AdminGlobalPanelFilter>(
                    Sql.GetAll,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);
                return all;
            }
        }

        public async Task<AdminGlobalPanelFilter> CreateAsync(AdminGlobalPanelFilter pf)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var created = await cn.QueryFirstOrDefaultAsync<AdminGlobalPanelFilter>(
                    Sql.Create,
                    new
                    {
                        sqlSetId = pf.SqlSetId,
                        sqlSetWhere = pf.SqlSetWhere,
                        sessionType = pf.SessionType,
                        isInclusion = pf.IsInclusion,
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);
                return created;
            }
        }

        public async Task<AdminGlobalPanelFilter> UpdateAsync(AdminGlobalPanelFilter pf)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var updated = await cn.QueryFirstOrDefaultAsync<AdminGlobalPanelFilter>(
                    Sql.Update,
                    new
                    {
                        id = pf.Id,
                        sqlSetId = pf.SqlSetId,
                        sqlSetWhere = pf.SqlSetWhere,
                        sessionType = pf.SessionType,
                        isInclusion = pf.IsInclusion,
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);
                return updated;
            }
        }

        public async Task<int?> DeleteAsync(int id)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var deleted = await cn.QueryFirstOrDefaultAsync<int?>(
                    Sql.Delete,
                    new { id },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);
                return deleted;
            }
        }

        static class Sql
        {
            public const string GetAll = "adm.sp_GetGlobalPanelFilters";
            public const string Update = "adm.sp_UpdateGlobalPanelFilter";
            public const string Create = "adm.sp_CreateGlobalPanelFilter";
            public const string Delete = "adm.sp_DeleteGlobalPanelFilter";
        }
    }
}
