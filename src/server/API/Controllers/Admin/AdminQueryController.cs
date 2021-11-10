// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
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

        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<BaseQueryDTO>>> GetUserQueries(string userId)
        {
            try
            {
                var queries = await manager.GetUserQueriesAsync(userId);
                return Ok(queries.Select(q => new BaseQueryDTO(q)));
            }
            catch (ArgumentNullException ane)
            {
                logger.LogError("Missing argument. Error:{Error}", ane.Message);
                return BadRequest();
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to get user queries. UserId:{user} Error:{Error}", userId, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}