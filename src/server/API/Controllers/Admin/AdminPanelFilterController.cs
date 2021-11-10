// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Error;
using Model.Admin.Compiler;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/panelfilter")]
    public class AdminPanelFilterController : Controller
    {
        readonly ILogger<AdminPanelFilterController> log;
        readonly AdminPanelFilterManager manager;

        public AdminPanelFilterController(
            ILogger<AdminPanelFilterController> log,
            AdminPanelFilterManager manager)
        {
            this.log = log;
            this.manager = manager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdminPanelFilter>>> GetAsync()
        {
            try
            {
                var panelFilters = await manager.GetAsync();
                return Ok(panelFilters);
            }
            catch (Exception e)
            {
                log.LogError("Failed to get admin panel filters. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult<AdminPanelFilter>> CreateAsync([FromBody] AdminPanelFilter pf)
        {
            try
            {
                var created = await manager.CreateAsync(pf);
                return created;
            }
            catch (ArgumentException ae)
            {
                log.LogError("Invalid create PanelFilter model. Model:{@Model} Error:{Error}", pf, ae.Message);
                return BadRequest();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to create PanelFilter. Model:{@Model} Error:{Error}", pf, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AdminPanelFilter>> UpdateAsync(int id, [FromBody] AdminPanelFilter pf)
        {
            try
            {
                if (pf != null)
                {
                    pf.Id = id;
                }
                var updated = await manager.UpdateAsync(pf);
                return updated;
            }
            catch (ArgumentException ae)
            {
                log.LogError("Invalid update PanelFilter model. Model:{@Model} Error:{Error}", pf, ae.Message);
                return BadRequest();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to update PanelFilter. Model:{@Model} Error:{Error}", pf, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<int?>> DeleteAsync(int id)
        {
            try
            {
                var deleted = await manager.DeleteAsync(id);
                if (!deleted.HasValue)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                log.LogError("Failed to delete PanelFilter. Id:{Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}