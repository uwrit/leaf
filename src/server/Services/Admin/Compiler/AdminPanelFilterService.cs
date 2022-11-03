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
    public class AdminPanelFilterService : AdminPanelFilterManager.IAdminPanelFilterService
    {
        readonly AppDbOptions opts;
        readonly IUserContext user;

        public AdminPanelFilterService(IOptions<AppDbOptions> opts, IUserContext userContext)
        {
            this.opts = opts.Value;
            this.user = userContext;
        }

        public async Task<IEnumerable<AdminPanelFilter>> GetAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var all = await cn.QueryAsync<AdminPanelFilter>(
                    Sql.GetAll,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);
                return all;
            }
        }

        public async Task<AdminPanelFilter> CreateAsync(AdminPanelFilter pf)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var created = await cn.QueryFirstOrDefaultAsync<AdminPanelFilter>(
                    Sql.Create,
                    new
                    {
                        conceptId = pf.ConceptId,
                        isInclusion = pf.IsInclusion,
                        uiDisplayText = pf.UiDisplayText,
                        uiDisplayDescription = pf.UiDisplayDescription,
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);
                return created;
            }
        }

        public async Task<AdminPanelFilter> UpdateAsync(AdminPanelFilter pf)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var updated = await cn.QueryFirstOrDefaultAsync<AdminPanelFilter>(
                    Sql.Update,
                    new
                    {
                        id = pf.Id,
                        conceptId = pf.ConceptId,
                        isInclusion = pf.IsInclusion,
                        uiDisplayText = pf.UiDisplayText,
                        uiDisplayDescription = pf.UiDisplayDescription,
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
            public const string GetAll = "adm.sp_GetPanelFilters";
            public const string Update = "adm.sp_UpdatePanelFilter";
            public const string Create = "adm.sp_CreatePanelFilter";
            public const string Delete = "adm.sp_DeletePanelFilter";
        }
    }
}
