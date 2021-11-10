// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Model.Options;
using Dapper;
using System.Threading.Tasks;
using System.Data.SqlClient;
using System.Data;
using Microsoft.Extensions.Options;
using Model.Notification;

namespace Services.Authentication
{
    public class AppStateService : IAppStateProvider
    {
        const string queryRefresh = @"app.sp_GetAppStateAndNotifications";

        readonly AppDbOptions opts;

        public AppStateService(IOptions<AppDbOptions> dbOpts)
        {
            opts = dbOpts.Value;
        }

        public async Task<AppState> GetAppState()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    queryRefresh,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return Read(grid);
            }
        }

        AppState Read(SqlMapper.GridReader grid)
        {
            var appState = grid.Read<AppState>().First();
            appState.Notifications = grid.Read<UserNotification>();

            return appState;
        }
    }
}
