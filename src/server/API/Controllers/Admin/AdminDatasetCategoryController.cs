// Copyright (c) 2020, UW Medicine Research IT, University of Washington
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
using Model.Admin.Compiler;
using API.DTO.Admin.Compiler;
using Model.Error;
using API.DTO.Admin;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/datasetcategory")]
    public class AdminDatasetCategoryController : Controller
    {
        readonly ILogger<AdminDatasetCategoryController> log;
        readonly AdminDatasetCategoryManager manager;

        public AdminDatasetCategoryController(
            AdminDatasetCategoryManager manager,
            ILogger<AdminDatasetCategoryController> log)
        {
            this.manager = manager;
            this.log = log;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DatasetQueryCategory>>> GetAsync()
        {
            try
            {
                var all = await manager.GetCategoriesAsync();
                return Ok(all);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to get DatasetQueryCategories. Error:{Error}", ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult<DatasetQueryCategory>> CreateAsync([FromBody] DatasetQueryCategory model)
        {
            try
            {
                var created = await manager.CreateCategoryAsync(model);
                return Ok(created);
            }
            catch (ArgumentException ae)
            {
                log.LogError("Invalid create DatasetQueryCategory model. Model:{@Model} Error:{Error}", model, ae.Message);
                return BadRequest();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to create DatasetQueryCategory. Model:{@Model} Error:{Error}", model, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DatasetQueryCategory>> UpdateAsync(int id, [FromBody] DatasetQueryCategory model)
        {
            try
            {
                if (model != null)
                {
                    model.Id = id;
                }

                var updated = await manager.UpdateCategoryAsync(model);
                return Ok(updated);
            }
            catch (ArgumentException ae)
            {
                log.LogError("Invalid update DatasetQueryCategory model. Model:{@Model} Error:{Error}", model, ae.Message);
                return BadRequest();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to update DatasetQueryCategory. Model:{@Model} Error:{Error}", model, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<DatasetQueryCategoryDeleteResponse>> DeleteAsync(int id)
        {
            try
            {
                var result = await manager.DeleteCategoryAsync(id);
                if (!result.Ok)
                {
                    return Conflict(new DatasetQueryCategoryDeleteResponse(result));
                }
                return Ok();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception ex)
            {
                log.LogError("Failed to delete DatasetQueryCategory. Id:{Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
