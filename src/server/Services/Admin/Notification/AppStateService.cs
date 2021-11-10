// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data.SqlClient;
using System.Data;
using Model.Options;
using Model.Admin.Compiler;
using Model.Authorization;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Dapper;
using Model.Admin.Notification;
using System.Collections.Generic;

namespace Services.Admin.Notification
{
    public class AdminAppStateService : AdminAppStateManager.IAdminAppStateService
    {
        readonly AppDbOptions opts;
        readonly IUserContext user;

        public AdminAppStateService(IOptions<AppDbOptions> opts, IUserContext userContext)
        {
            this.opts = opts.Value;
            this.user = userContext;
        }

        public async Task<AdminAppState> GetAppStateAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var appState = await cn.QueryFirstOrDefaultAsync<AdminAppState>(
                    Sql.GetAppState,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return appState;
            }
        }

        public async Task<AdminAppState> UpdateAppStateAsync(AdminAppState appState)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var updated = await cn.QueryFirstOrDefaultAsync<AdminAppState>(
                    Sql.UpdateAppState,
                    new
                    {
                        user = user.UUID,
                        isUp = appState.IsUp,
                        downtimeMessage = appState.DowntimeMessage,
                        downtimeUntil = appState.DowntimeUntil
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return updated;
            }
        }

        public async Task<IEnumerable<AdminUserNotification>> GetUserNotificationsAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var notifications = await cn.QueryAsync<AdminUserNotification>(
                    Sql.GetNotifications,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return notifications;
            }
        }

        public async Task<AdminUserNotification> UpsertUserNotificationAsync(AdminUserNotification notification)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var updated = await cn.QueryFirstOrDefaultAsync<AdminUserNotification>(
                    Sql.UpsertNotification,
                    new
                    {
                        user = user.UUID,
                        id = notification.Id,
                        message = notification.Message,
                        until = notification.Until
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                return updated;
            }
        }

        class Sql
        {
            public const string GetAppState = "adm.sp_GetAppState";
            public const string UpdateAppState = "adm.sp_UpdateAppState";
            public const string GetNotifications = "adm.sp_GetUserNotifications";
            public const string UpsertNotification = "adm.sp_UpsertNotifications";
        }
    }
}
