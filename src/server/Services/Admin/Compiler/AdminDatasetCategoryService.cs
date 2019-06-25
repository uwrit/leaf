// Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
using Model.Error;
using Model.Admin.Compiler;
using Model.Authorization;
using Model.Tagging;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Dapper;
using Model.Compiler;
using Services.Tables;
using Model.Extensions;

namespace Services.Admin.Compiler
{
    public class AdminDatasetCategoryService : AdminDatasetCategoryManager.IAdminDatasetCategoryService
    {
        readonly IUserContext user;
        readonly AppDbOptions opts;

        public AdminDatasetCategoryService(
            IUserContext userContext,
            IOptions<AppDbOptions> opts)
        {
            this.user = userContext;
            this.opts = opts.Value;
        }

        public async Task<DatasetQueryCategory> CreateCategoryAsync(DatasetQueryCategory cat)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var created = await cn.QueryFirstOrDefaultAsync<DatasetQueryCategory>(
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

        public async Task<IEnumerable<DatasetQueryCategory>> GetCategoriesAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var all = await cn.QueryAsync<DatasetQueryCategory>(
                    Sql.Get,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return all;
            }
        }

        public async Task<DatasetQueryCategory> UpdateCategoryAsync(DatasetQueryCategory cat)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var updated = await cn.QueryFirstOrDefaultAsync<DatasetQueryCategory>(
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

        public async Task<DatasetQueryCategoryDeleteResult> DeleteCategoryAsync(int id)
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

                return new DatasetQueryCategoryDeleteResult
                {
                    DatasetQueryDependents = deps.Select(d => new DatasetQueryDependent { Id = d })
                };
            }
        }

        static class Sql
        {
            public const string Create = "adm.sp_CreateDatasetQueryCategory";
            public const string Get = "adm.sp_GetDatasetQueryCategory";
            public const string Update = "adm.sp_UpdateDatasetQueryCategory";
            public const string Delete = "adm.sp_DeleteDatasetQueryCategory";
        }
    }
}
