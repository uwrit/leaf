// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using API.DTO.Compiler;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Admin.Query;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/query")]
    public class AdminQueryController : Controller
    {
        readonly ILogger<AdminQueryController> logger;
        readonly AdminQueryManager manager;

        public AdminQueryController(ILogger<AdminQueryController> logger, AdminQueryManager manager)
        {
            this.logger = logger;
            this.manager = manager;
        }

        [HttpGet("search/users")]
        public async Task<ActionResult<IEnumerable<LeafUser>>> SearchUsers([FromQuery] string term)
        {
            try
            {
                var users = await manager.SearchUsersAsync(term);
                return Ok(users);
            }
            catch (ArgumentNullException ane)
            {
                logger.LogError("Missing argument. Error:{Error}", ane.Message);
                return BadRequest();
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to search users. Term:{Term} Error:{Error}", term, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("{id}/queries")]
        public async Task<ActionResult<IEnumerable<BaseQueryDTO>>> GetUserQueries(LeafUser user)
        {
            try
            {
                var queries = await manager.GetUserQueriesAsync(user);
                return Ok(queries);
            }
            catch (ArgumentNullException ane)
            {
                logger.LogError("Missing argument. Error:{Error}", ane.Message);
                return BadRequest();
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to get user queries. User:{user} Error:{Error}", user, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}