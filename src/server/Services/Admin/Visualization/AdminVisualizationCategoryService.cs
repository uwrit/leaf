// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.SqlClient;
using System.Data;
using Model.Options;
using Model.Authorization;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Dapper;
using Model.Admin.Visualization;

namespace Services.Admin.Compiler
{
    public class AdminVisualizationCategoryService : AdminVisualizationCategoryManager.IAdminVisualizationCategoryService
    {
        readonly IUserContext user;
        readonly AppDbOptions opts;

        public AdminVisualizationCategoryService(
            IUserContext userContext,
            IOptions<AppDbOptions> opts)
        {
            this.user = userContext;
            this.opts = opts.Value;
        }

        public async Task<AdminVisualizationCategory> CreateVisualizationCategoryAsync(AdminVisualizationCategory cat)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var created = await cn.QueryFirstOrDefaultAsync<AdminVisualizationCategory>(
                    Sql.Create,
                    new
                    {
                        cat = cat.Category,
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return created;
            }
        }

        public async Task<IEnumerable<AdminVisualizationCategory>> GetVisualizationCategoriesAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var all = await cn.QueryAsync<AdminVisualizationCategory>(
                    Sql.Get,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return all;
            }
        }

        public async Task<AdminVisualizationCategory> UpdateVisualizationCategoryAsync(AdminVisualizationCategory cat)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var updated = await cn.QueryFirstOrDefaultAsync<AdminVisualizationCategory>(
                    Sql.Update,
                    new
                    {
                        id = cat.Id,
                        cat = cat.Category,
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return updated;
            }
        }

        public async Task<VisualizationCategoryDeleteResult> DeleteVisualizationCategoryAsync(Guid id)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var deps = await cn.QueryAsync<Guid>(
                    Sql.Delete,
                    new
                    {
                        id,
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return new VisualizationCategoryDeleteResult
                {
                    VisualizationCategoryDependents = deps.Select(d => new VisualizationCategoryDependent { Id = d })
                };
            }
        }

        static class Sql
        {
            public const string Create = "adm.sp_CreateVisualizationCategory";
            public const string Get = "adm.sp_GetVisualizationCategories";
            public const string Update = "adm.sp_UpdateVisualizationCategory";
            public const string Delete = "adm.sp_DeleteVisualizationCategory";
        }
    }
}
