// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Model.Options;
using Model.Admin.User;
using Microsoft.Extensions.Options;
using System.Data.SqlClient;
using Dapper;
using System.Data;

namespace Services.Admin.User
{
    public class AdminUserService : AdminUserManager.IAdminUserService
    {
        readonly AppDbOptions opts;

        public AdminUserService(IOptions<AppDbOptions> options)
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

        static class Sql
        {
            public static string UsersBySearchTerm = @"adm.sp_GetUsersBySearchTerm";
        }
    }
}
