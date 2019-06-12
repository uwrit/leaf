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
        public async Task<ActionResult> DeleteAsync(int id)
        {
            // TODO(cspital) START HERE
            return NotFound();
        }
    }
}
