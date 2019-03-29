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
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Services.Admin;
using Model.Admin;
using DTO.Admin;
using Services;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/specialization")]
    public class AdminSpecializationController : Controller
    {
        readonly ILogger<AdminSpecializationController> logger;
        readonly IAdminSpecializationService specializationService;

        public AdminSpecializationController(ILogger<AdminSpecializationController> logger, IAdminSpecializationService specializationService)
        {
            this.logger = logger;
            this.specializationService = specializationService;
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(Guid id, [FromBody] SpecializationDTO dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest("Specialization is missing.");
                }
                if (dto.Id == default)
                {
                    return BadRequest("Specialization.Id is missing.");
                }
                if (dto.SpecializationGroupId == default)
                {
                    return BadRequest("Specialization.SpecializationGroupId is required.");
                }
                if (string.IsNullOrWhiteSpace(dto.UiDisplayText))
                {
                    return BadRequest("Specialization.UiDisplayText is required.");
                }
                if (string.IsNullOrWhiteSpace(dto.SqlSetWhere))
                {
                    return BadRequest("Specialization.SqlSetWhere is required.");
                }

                var spec = dto.ConceptSpecialization();
                var updated = await specializationService.Update(spec);
                if (updated == null)
                {
                    return NotFound();
                }
                return Ok(SpecializationDTO.From(updated));
            }
            catch (FormatException fe)
            {
                logger.LogError("Malformed Specialization:{@Specialization} Error:{Error}", dto, fe.Message);
                return BadRequest("Malformed Specialization.UniversalId.");
            }
            catch (LeafDbException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception e)
            {
                logger.LogError("Could not update Specialization:{@Specialization} Error:{Error}", dto, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] SpecializationDTO dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest("Specialization is missing.");
                }
                if (dto.SpecializationGroupId == default)
                {
                    return BadRequest("Specialization.SpecializationGroupId is required.");
                }
                if (string.IsNullOrWhiteSpace(dto.UiDisplayText))
                {
                    return BadRequest("Specialization.UiDisplayText is required.");
                }
                if (string.IsNullOrWhiteSpace(dto.SqlSetWhere))
                {
                    return BadRequest("Specialization.SqlSetWhere is required.");
                }

                var spec = dto.ConceptSpecialization();
                var created = await specializationService.Create(spec);
                return Ok(created);
            }
            catch (FormatException fe)
            {
                logger.LogError("Malformed Specialization:{@Specialization} Error:{Error}", dto, fe.Message);
                return BadRequest("Malformed Specialization.UniversalId.");
            }
            catch (LeafDbException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception e)
            {
                logger.LogError("Could not create Specialization:{@Specialization} Error:{Error}", dto, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(Guid id)
        {
            try
            {
                var deleted = await specializationService.Delete(id);
                if (deleted == null)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                logger.LogError("Could not delete Specialization. Id:{Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
