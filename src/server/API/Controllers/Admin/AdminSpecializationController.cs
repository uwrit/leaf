// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using API.DTO.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Model.Admin;
using Model.Authorization;
using Model.Error;
using Model.Admin.Compiler;
using API.DTO.Admin.Compiler;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/specialization")]
    public class AdminSpecializationController : Controller
    {
        readonly ILogger<AdminSpecializationController> logger;
        readonly AdminSpecializationManager manager;

        public AdminSpecializationController(ILogger<AdminSpecializationController> logger, AdminSpecializationManager manager)
        {
            this.logger = logger;
            this.manager = manager;
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<SpecializationDTO>> Update(Guid id, [FromBody] SpecializationDTO dto)
        {
            try
            {
                if (dto != null)
                {
                    dto.Id = id;
                }

                var spec = dto.ConceptSpecialization();
                var updated = await manager.UpdateAsync(spec);
                if (updated == null)
                {
                    return NotFound();
                }
                return Ok(SpecializationDTO.From(updated));
            }
            catch (FormatException fe)
            {
                logger.LogError("Malformed Specialization:{@Specialization} Error:{Error}", dto, fe.Message);
                return BadRequest(CRUDError.From("Malformed Specialization.UniversalId."));
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid update Specialization model. Model:{@Model} Error:{Error}", dto, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(Specialization)} is missing or incomplete."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to update Specialization:{@Specialization} Error:{Error}", dto, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] SpecializationDTO dto)
        {
            try
            {
                var spec = dto.ConceptSpecialization();
                var created = await manager.CreateAsync(spec);
                return Ok(SpecializationDTO.From(created));
            }
            catch (FormatException fe)
            {
                logger.LogError("Malformed Specialization:{@Specialization} Error:{Error}", dto, fe.Message);
                return BadRequest(CRUDError.From("Malformed Specialization.UniversalId."));
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid create Specialization model. Model:{@Model} Error:{Error}", dto, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(Specialization)} is missing or incomplete."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to create Specialization:{@Specialization} Error:{Error}", dto, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                var deleted = await manager.DeleteAsync(id);
                if (deleted == null)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid Specialization Id. Id:{Id} Error:{Error}", id, ae.Message);
                return BadRequest(CRUDError.From("Invalid id value."));
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to delete Specialization. Id:{Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
