// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using System.Data.Common;
using Model.Error;
using System.Collections.Generic;
using Model.Admin.Notification;

namespace Model.Admin.Compiler
{
    public class AdminAppStateManager
    {
        public interface IAdminAppStateService
        {
            Task<AdminAppState> GetAppStateAsync();
            Task<AdminAppState> UpdateAppStateAsync(AdminAppState appState);
            Task<IEnumerable<AdminUserNotification>> GetUserNotificationsAsync();
            Task<AdminUserNotification> UpsertUserNotificationAsync(AdminUserNotification notification);
        }

        readonly IAdminAppStateService svc;
        readonly ILogger<AdminAppStateManager> log;

        public AdminAppStateManager(
            IAdminAppStateService service,
            ILogger<AdminAppStateManager> log)
        {
            svc = service;
            this.log = log;
        }

        public async Task<AdminAppState> GetAppStateAsync()
        {
            log.LogInformation("Getting AppState.");
            return await svc.GetAppStateAsync();
        }

        public async Task<AdminAppState> UpdateAppStateAsync(AdminAppState appState)
        {
            try
            {
                var updated = await svc.UpdateAppStateAsync(appState);
                log.LogInformation("Updated AppState. AppState:{@AppState}", updated);
                return updated;
            }
            catch (DbException db)
            {
                log.LogError("Failed to update AppState. AppState:{@AppState} Code:{Code} Error:{Error}", appState, db.ErrorCode, db.Message);
                db.MapThrow();
                throw;
            }
        }

        public async Task<IEnumerable<AdminUserNotification>> GetUserNotificationsAsync()
        {
            log.LogInformation("Getting UserNotifications.");
            return await svc.GetUserNotificationsAsync();
        }

        public async Task<AdminUserNotification> UpsertUserNotificationAsync(AdminUserNotification userNotification)
        {
            try
            {
                var updated = await svc.UpsertUserNotificationAsync(userNotification);
                log.LogInformation("Updated UserNotification. UserNotification:{@UserNotification}", updated);
                return updated;
            }
            catch (DbException db)
            {
                log.LogError("Failed to update UserNotification. UserNotification:{@UserNotification} Code:{Code} Error:{Error}", userNotification, db.ErrorCode, db.Message);
                db.MapThrow();
                throw;
            }
        }
    }
}
