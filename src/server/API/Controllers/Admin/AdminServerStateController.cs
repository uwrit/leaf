// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Model.Authorization;
using Microsoft.Extensions.Logging;
using Model.Admin.Compiler;
using Model.Error;
using Model.Admin.Notification;
using System.Collections.Generic;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/state")]
    public class AdminServerStateController : Controller
    {
        readonly ILogger<AdminServerStateController> log;
        readonly AdminServerStateManager manager;

        public AdminServerStateController(
            AdminServerStateManager manager,
            ILogger<AdminServerStateController> log)
        {
            this.manager = manager;
            this.log = log;
        }

        [HttpGet]
        public async Task<ActionResult<AdminServerState>> GetServerState()
        {
            try
            {
                var state = await manager.GetServerStateAsync();
                return Ok(state);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to get AdminServerState. Error:{Error}", ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut]
        public async Task<ActionResult<AdminServerState>> Update(AdminServerState state)
        {
            try
            {
                var updated = await manager.UpdateServerStateAsync(state);
                return Ok(updated);
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to update AdminServerState. AdminServerState:{@AdminServerState} Error:{Error}", state, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("notifications")]
        public async Task<ActionResult<IEnumerable<AdminUserNotification>>> GetNotifications()
        {
            try
            {
                var notifications = await manager.GetUserNotificationsAsync();
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to get AdminUserNotifications. Error:{Error}", ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("notifications/{id}")]
        public async Task<ActionResult<AdminUserNotification>> UpsertNotification(AdminUserNotification notification)
        {
            try
            {
                var updated = await manager.UpsertUserNotificationAsync(notification);
                return Ok(updated);
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to update AdminUserNotification. AdminUserNotification:{@AdminUserNotification} Error:{Error}", notification, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
