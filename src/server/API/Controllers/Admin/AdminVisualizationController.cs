// Copyright (c) 2020, UW Medicine Research IT, University of Washington
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
using API.DTO.Admin.Visualization;
using Model.Admin.Visualization;
using Model.Error;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/visualization")]
    public class AdminVisualizationController : Controller
    {
        readonly ILogger<AdminVisualizationController> log;
        readonly AdminVisualizationPageManager manager;

        public AdminVisualizationController(
            AdminVisualizationPageManager manager,
            ILogger<AdminVisualizationController> log)
        {
            this.manager = manager;
            this.log = log;
        }

        [HttpPost]
        public async Task<ActionResult<AdminVisualizationPageDTO>> CreateAsync([FromBody] AdminVisualizationPageDTO dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest();
                }

                var query = dto.AdminVisualizationPage();
                var created = await manager.CreateVisualizationPageAsync(query);
                return Ok(created.AdminVisualizationPageDTO());
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to create VisualizationPage. Model:{@Model} Error:{Error}", dto, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AdminVisualizationPageDTO>> UpdateAsync(Guid id, [FromBody] AdminVisualizationPageDTO dto)
        {
            try
            {
                if (dto != null)
                {
                    dto.Id = id;
                }
                var query = dto.AdminVisualizationPage();
                var updated = await manager.UpdateDatasetQueryAsync(query);
                return Ok(updated.AdminVisualizationPageDTO());
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to update VisualizationPage. Model:{@Model} Error:{Error}", dto, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAsync(Guid id)
        {
            try
            {
                var deleted = await manager.DeleteVisualizationPageAsync(id);
                if (!deleted.HasValue)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                log.LogError("Failed to delete VisualizationPage. Id:{Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
