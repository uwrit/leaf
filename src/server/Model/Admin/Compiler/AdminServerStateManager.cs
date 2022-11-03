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
    public class AdminServerStateManager
    {
        public interface IAdminServerStateService
        {
            Task<AdminServerState> GetServerStateAsync();
            Task<AdminServerState> UpdateServerStateAsync(AdminServerState serverState);
            Task<IEnumerable<AdminUserNotification>> GetUserNotificationsAsync();
            Task<AdminUserNotification> UpsertUserNotificationAsync(AdminUserNotification notification);
        }

        readonly IAdminServerStateService svc;
        readonly ILogger<AdminServerStateManager> log;

        public AdminServerStateManager(
            IAdminServerStateService service,
            ILogger<AdminServerStateManager> log)
        {
            svc = service;
            this.log = log;
        }

        public async Task<AdminServerState> GetServerStateAsync()
        {
            log.LogInformation("Getting ServerState.");
            return await svc.GetServerStateAsync();
        }

        public async Task<AdminServerState> UpdateServerStateAsync(AdminServerState state)
        {
            try
            {
                var updated = await svc.UpdateServerStateAsync(state);
                log.LogInformation("Updated ServerState. ServerState:{@ServerState}", updated);
                return updated;
            }
            catch (DbException db)
            {
                log.LogError("Failed to update ServerState. ServerState:{@ServerState} Code:{Code} Error:{Error}", state, db.ErrorCode, db.Message);
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
