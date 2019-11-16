// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Model.Options;
using Model.Compiler;
using Model.Admin.Query;
using Microsoft.Extensions.Options;
using System.Data.SqlClient;
using Dapper;
using System.Data;

namespace Services.Admin.Query
{
    public class AdminQueryService : AdminQueryManager.IAdminQueryService
    {
        readonly AppDbOptions opts;

        public AdminQueryService(IOptions<AppDbOptions> options)
        {
            opts = options.Value;
        }

        public async Task<IEnumerable<LeafUser>> SearchUsersAsync(string term)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var users = await cn.QueryAsync<LeafUser>(
                        Sql.UsersBySearchTerm,
                        new { term },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout
                    );
                return users;
            }
        }

        public async Task<IEnumerable<BaseQuery>> GetUserQueriesAsync(string userId)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var queries = await cn.QueryAsync<BaseQuery>(
                        Sql.SavedQueriesByOwner,
                        new { user = userId },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout
                    );
                return queries;
            }
        }

        static class Sql
        {
            public static string SavedQueriesByOwner = @"app.sp_GetSavedBaseQueriesByOwner";
            public static string UsersBySearchTerm = @"adm.sp_GetUsersBySearchTerm";
        }
    }
}
