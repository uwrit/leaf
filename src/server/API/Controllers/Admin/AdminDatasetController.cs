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
    [Route("api/admin/dataset")]
    public class AdminDatasetController : Controller
    {
        readonly ILogger<AdminDatasetController> log;
        readonly AdminDatasetQueryManager manager;

        public AdminDatasetController(
            AdminDatasetQueryManager manager,
            ILogger<AdminDatasetController> log)
        {
            this.manager = manager;
            this.log = log;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AdminDatasetQueryDTO>> GetAsync(Guid id)
        {
            try
            {
                var query = await manager.GetDatasetQueryAsync(id);
                if (query == null)
                {
                    return NotFound();
                }
                return Ok(query.AdminDatasetQueryDTO());
            }
            catch (FormatException fe)
            {
                log.LogError("Malformed DatasetQueryUrn UniversalId. Error:{Error}", fe.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
            catch (Exception e)
            {
                log.LogError("Failed to get DatasetQuery. Id:{Id} Error:{Error}", id, e.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateAsync(Guid id, [FromBody] AdminDatasetQueryDTO dto)
        {
            try
            {
                if (dto != null)
                {
                    dto.Id = id;
                }
                var query = dto.AdminDatasetQuery();
                var result = await manager.UpdateDatasetQueryAsync(query);
                return Ok(result.New.AdminDatasetQueryDTO());
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
    }
}
