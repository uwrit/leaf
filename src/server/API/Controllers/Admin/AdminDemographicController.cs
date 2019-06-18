// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Model.Authorization;
using Microsoft.Extensions.Logging;
using Model.Admin.Compiler;
using API.DTO.Admin.Compiler;
using Model.Error;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/demographics")]
    public class AdminDemographicController : Controller
    {
        readonly ILogger<AdminDemographicController> log;
        readonly AdminDemographicsManager manager;

        public AdminDemographicController(
            AdminDemographicsManager manager,
            ILogger<AdminDemographicController> log)
        {
            this.manager = manager;
            this.log = log;
        }

        [HttpGet]
        public async Task<ActionResult<AdminDemographicQuery>> Get()
        {
            try
            {
                var query = await manager.GetDemographicQueryAsync();
                if (query == null)
                {
                    query = new AdminDemographicQuery();
                }
                return Ok(query);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to get DemographicsQuery. Error:{Error}", ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut]
        public async Task<ActionResult<AdminDemographicQuery>> Update([FromBody] AdminDemographicQuery model)
        {
            try
            {
                var updated = await manager.UpdateDemographicQueryAsync(model);
                return Ok(updated);
            }
            catch (ArgumentException ae)
            {
                log.LogError("Invalid update DemographicsQuery model. Model:{@Model} Error:{Error}", model, ae.Message);
                return BadRequest();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to update DemographicsQuery. Model:{@Model} Error:{Error}", model, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
