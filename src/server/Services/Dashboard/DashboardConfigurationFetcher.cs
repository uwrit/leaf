// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Options;
using Dapper;
using System.Data;
using Services.Tables;
using System.Collections.Generic;
using Model.Dashboard;

namespace Services.Dashboard
{
    public class DashboardConfigurationFetcher : IDashboardConfigurationFetcher
    {
        const string getById = "app.sp_GetDashboardConfigById";
        const string getAll = "app.sp_GetDashboardConfigs";

        readonly AppDbOptions dbOptions;
        readonly IUserContext user;

        public DashboardConfigurationFetcher(IOptions<AppDbOptions> dbOptions, IUserContext user)
        {
            this.dbOptions = dbOptions.Value;
            this.user = user;
        }

        public async Task<IEnumerable<DashboardConfiguration>> FetchAsync()
        {
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                await cn.OpenAsync();

                var configs = await cn.QueryAsync<DashboardConfiguration>(
                    getAll,
                    new {
                        user = user.UUID,
                        groups = GroupMembership.From(user),
                        admin = user.IsAdmin
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );

                return configs;
            }
        }

        public async Task<DashboardConfiguration> FetchByIdAsync(Guid id)
        {
            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                await cn.OpenAsync();

                var config = await cn.QueryFirstAsync<DashboardConfiguration>(
                    getById,
                    new {
                        id,
                        user = user.UUID,
                        groups = GroupMembership.From(user),
                        admin = user.IsAdmin
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOptions.DefaultTimeout
                );

                return config;
            }
        }
    }
}