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
using Model.Authorization;
using Microsoft.Extensions.Logging;
using Model.Admin.Visualization;
using Model.Error;
using API.DTO.Admin.Visualization;
using API.DTO.Admin;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/visualizationcategory")]
    public class AdminVisualizationCategoryController : Controller
    {
        readonly ILogger<AdminVisualizationCategoryController> log;
        readonly AdminVisualizationCategoryManager manager;

        public AdminVisualizationCategoryController(
            AdminVisualizationCategoryManager manager,
            ILogger<AdminVisualizationCategoryController> log)
        {
            this.manager = manager;
            this.log = log;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdminVisualizationCategory>>> GetAsync()
        {
            try
            {
                var all = await manager.GetVisualizationCategoriesAsync();
                return Ok(all);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to get VisualizationCategories. Error:{Error}", ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult<AdminVisualizationCategory>> CreateAsync([FromBody] AdminVisualizationCategory model)
        {
            try
            {
                var created = await manager.CreateVisualizationCategoryAsync(model);
                return Ok(created);
            }
            catch (ArgumentException ae)
            {
                log.LogError("Invalid create AdminVisualizationCategory model. Model:{@Model} Error:{Error}", model, ae.Message);
                return BadRequest();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to create AdminVisualizationCategory. Model:{@Model} Error:{Error}", model, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AdminVisualizationCategory>> UpdateAsync(Guid id, [FromBody] AdminVisualizationCategory model)
        {
            try
            {
                if (model != null)
                {
                    model.Id = id;
                }

                var updated = await manager.UpdateVisualizationCategoryAsync(model);
                return Ok(updated);
            }
            catch (ArgumentException ae)
            {
                log.LogError("Invalid update AdminVisualizationCategory model. Model:{@Model} Error:{Error}", model, ae.Message);
                return BadRequest();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to update AdminVisualizationCategory. Model:{@Model} Error:{Error}", model, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<VisualizationCategoryDeleteResponse>> DeleteAsync(Guid id)
        {
            try
            {
                var result = await manager.DeleteVisualizationCategoryAsync(id);
                if (!result.Ok)
                {
                    return Conflict(new VisualizationCategoryDeleteResponse(result));
                }
                return Ok();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception ex)
            {
                log.LogError("Failed to delete AdminVisualizationCategory. Id:{Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
