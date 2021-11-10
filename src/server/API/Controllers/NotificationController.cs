// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using API.DTO.Compiler;
using API.DTO.Notification;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Notification;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Produces("application/json")]
    [Route("api/notification")]
    public class NotificationController : Controller
    {
        readonly ILogger<NotificationController> log;
        readonly NotificationManager manager;

        public NotificationController(NotificationManager manager, ILogger<NotificationController> logger)
        {
            log = logger;
            this.manager = manager;
        }

        [HttpPost("inquiry")]
        public async Task<ActionResult<bool>> NotifyUserInquiry([FromBody] UserInquiryDTO inquiry)
        {
            try
            {
                var success = await manager.SendUserInquiry(inquiry.ToInquiry());
                return Ok(success);
            }
            catch (Exception e)
            {
                log.LogInformation("Failed to send user inquiry. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
