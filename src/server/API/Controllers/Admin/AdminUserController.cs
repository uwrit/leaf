// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Admin.Query;
using Model.Admin.User;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/user")]
    public class AdminUserController : Controller
    {
        readonly ILogger<AdminQueryController> logger;
        readonly AdminUserManager manager;

        public AdminUserController(ILogger<AdminQueryController> logger, AdminUserManager manager)
        {
            this.logger = logger;
            this.manager = manager;
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<LeafUser>>> SearchUsers([FromQuery] string name)
        {
            try
            {
                var users = await manager.SearchUsersAsync(name);
                return Ok(users);
            }
            catch (ArgumentNullException ane)
            {
                logger.LogError("Missing argument. Error:{Error}", ane.Message);
                return BadRequest();
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to search users. Term:{Term} Error:{Error}", name, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}