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
    public class AdminDemographicQueryService : AdminDemographicsManager.IAdminDemographicQueryService
    {
        readonly AppDbOptions opts;
        readonly IUserContext user;

        public AdminDemographicQueryService(IOptions<AppDbOptions> opts, IUserContext userContext)
        {
            this.opts = opts.Value;
            this.user = userContext;
        }

        public async Task<AdminDemographicQuery> GetDemographicQueryAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var demo = await cn.QueryFirstOrDefaultAsync<AdminDemographicQuery>(
                    Sql.Get,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return demo;
            }
        }

        public async Task<AdminDemographicQuery> UpdateDemographicQueryAsync(AdminDemographicQuery query)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var updated = await cn.QueryFirstOrDefaultAsync<AdminDemographicQuery>(
                    Sql.Update,
                    new { sql = query.SqlStatement, user = user.UUID },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return updated;
            }
        }

        class Sql
        {
            public const string Get = "adm.sp_GetDemographicQuery";
            public const string Update = "adm.sp_UpdateDemographicQuery";
        }
    }
}
