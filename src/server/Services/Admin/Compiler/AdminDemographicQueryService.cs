// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using Model.Options;
using Model.Admin.Compiler;
using Model.Authorization;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Dapper;
using Services.Search;

namespace Services.Admin.Compiler
{
    public class AdminDemographicQueryService : AdminDemographicsManager.IAdminDemographicQueryService
    {
        readonly AppDbOptions opts;
        readonly IUserContext user;

        public AdminDemographicQueryService(IOptions<AppDbOptions> opts, IUserContextProvider userContextProvider)
        {
            this.opts = opts.Value;
            this.user = userContextProvider.GetUserContext();
        }

        public async Task<AdminDemographicQuery> GetDemographicQueryAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var demo = await cn.QueryFirstOrDefaultAsync<AdminDemographicQueryRecord>(
                    Sql.Get,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                if (demo != null) return demo.ToAdminDemographicQuery();
                return new AdminDemographicQuery
                {
                    SqlStatement = "",
                    ColumnNames = new Dictionary<string, string>()
                };
            }
        }

        public async Task<AdminDemographicQuery> UpdateDemographicQueryAsync(AdminDemographicQuery query)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var updated = await cn.QueryFirstOrDefaultAsync<AdminDemographicQueryRecord>(
                    Sql.Update,
                    new
                    {
                        sql = query.SqlStatement,
                        columns = ColumnNamesSerde.Serialize(query.ColumnNames),
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return updated.ToAdminDemographicQuery();
            }
        }

        class Sql
        {
            public const string Get = "adm.sp_GetDemographicQuery";
            public const string Update = "adm.sp_UpdateDemographicQuery";
        }

        class AdminDemographicQueryRecord
        {
            public string SqlStatement { get; set; }
            public string ColumnNamesJson { get; set; }
            public DateTime LastChanged { get; set; }
            public string ChangedBy { get; set; }

            public AdminDemographicQuery ToAdminDemographicQuery()
            {
                return new AdminDemographicQuery
                {
                    SqlStatement = SqlStatement,
                    ColumnNames = ColumnNamesSerde.Deserialize(ColumnNamesJson),
                    LastChanged = LastChanged,
                    ChangedBy = ChangedBy
                };
            }
        }
    }
}
