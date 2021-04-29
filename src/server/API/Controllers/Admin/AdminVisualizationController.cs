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
using Model.Admin.Compiler;
using API.DTO.Admin.Compiler;
using Model.Error;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/visualization")]
    public class AdminVisualizationController : Controller
    {
        readonly ILogger<AdminVisualizationController> log;
        readonly AdminDatasetQueryManager manager;

        public AdminVisualizationController(
            AdminDatasetQueryManager manager,
            ILogger<AdminVisualizationController> log)
        {
            this.manager = manager;
            this.log = log;
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AdminDatasetQueryDTO>> UpdateAsync(Guid id, [FromBody] AdminDatasetQueryDTO dto)
        {
            try
            {
                if (dto != null)
                {
                    dto.Id = id;
                }
                var query = dto.AdminDatasetQuery();
                var updated = await manager.UpdateDatasetQueryAsync(query);
                return Ok(updated.AdminDatasetQueryDTO());
            }
            catch (FormatException fe)
            {
                log.LogError("Malformed DatasetQueryUrn UniversalId. Error:{Error}", fe.Message);
                return BadRequest();
            }
            catch (ArgumentException ae)
            {
                log.LogError("Invalid update DatasetQuery model. Model:{@Model} Error:{Error}", dto, ae.Message);
                return BadRequest();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to update DatasetQuery. Model:{@Model} Error:{Error}", dto, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult<AdminDatasetQueryDTO>> CreateAsync([FromBody] AdminDatasetQueryDTO dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest();
                }

                var query = dto.AdminDatasetQuery();
                var created = await manager.CreateDatasetQueryAsync(query);
                return Ok(created.AdminDatasetQueryDTO());
            }
            catch (FormatException fe)
            {
                log.LogError("Malformed DatasetQueryUrn UniversalId. Error:{Error}", fe.Message);
                return BadRequest();
            }
            catch (ArgumentException ae)
            {
                log.LogError("Invalid create DatasetQuery model. Model:{@Model} Error:{Error}", dto, ae.Message);
                return BadRequest();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to create DatasetQuery. Model:{@Model} Error:{Error}", dto, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAsync(Guid id)
        {
            try
            {
                var deleted = await manager.DeleteDatasetQueryAsync(id);
                if (!deleted.HasValue)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                log.LogError("Failed to delete DatasetQuery. Id:{Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
