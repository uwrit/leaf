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
    [Route("api/admin/specializationgroup")]
    public class AdminSpecializationGroupController : Controller
    {
        readonly ILogger<AdminSpecializationGroupController> logger;
        readonly IAdminSpecializationGroupService sgService;

        public AdminSpecializationGroupController(ILogger<AdminSpecializationGroupController> logger, IAdminSpecializationGroupService adminSpecializationGroupService)
        {
            this.logger = logger;
            sgService = adminSpecializationGroupService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SpecializationGroupDTO>>> Get()
        {
            try
            {
                var groups = await sgService.Get();
                return Ok(groups.Select(SpecializationGroupDTO.From));
            }
            catch (Exception e)
            {
                logger.LogError("Could not get SpecializationGroups. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<SpecializationGroupDTO>> Update(int id, [FromBody] SpecializationGroupDTO dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest("SpecializationGroup is missing.");
                }
                if (dto.Id == default)
                {
                    return BadRequest("SpecializationGroup.Id is missing.");
                }
                if (dto.SqlSetId == default)
                {
                    return BadRequest("SpecializationGroup.SqlSetId is missing.");
                }
                if (string.IsNullOrWhiteSpace(dto.UiDefaultText))
                {
                    return BadRequest("SpecializationGroup.UiDefaultText is missing.");
                }

                var group = dto.SpecializationGroup();
                var updated = await sgService.Update(group);
                if (updated == null)
                {
                    return NotFound();
                }
                return Ok(SpecializationGroupDTO.From(updated));
            }
            catch (FormatException fe)
            {
                logger.LogError("Malformed SpecializationGroup:{@SpecializationGroup} Error:{Error}", dto, fe.Message);
                return BadRequest(CRUDError.From(fe.Message));
            }
            catch (LeafDbException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Could not update SpecializationGroup:{@SpecializationGroup} Error:{Error}", dto, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult<SpecializationGroupDTO>> Create([FromBody] SpecializationGroupDTO dto)
        {
            try
            {
                if (dto == null)
                {
                    return BadRequest("SpecializationGroup is missing.");
                }
                if (dto.Id == default)
                {
                    return BadRequest("SpecializationGroup.Id is missing.");
                }
                if (dto.SqlSetId == default)
                {
                    return BadRequest("SpecializationGroup.SqlSetId is missing.");
                }
                if (string.IsNullOrWhiteSpace(dto.UiDefaultText))
                {
                    return BadRequest("SpecializationGroup.UiDefaultText is missing.");
                }
                if (dto.Specializations?.Any(s => string.IsNullOrWhiteSpace(s.SqlSetWhere) || string.IsNullOrWhiteSpace(s.UiDisplayText)) ?? false)
                {
                    return BadRequest("Malformed Specializations.");
                }

                var group = dto.SpecializationGroup();
                var created = await sgService.Create(group);
                return Ok(SpecializationGroupDTO.From(created));

            }
            catch (FormatException fe)
            {
                logger.LogError("Malformed SpecializationGroup:{@SpecializationGroup} Error:{Error}", dto, fe.Message);
                return BadRequest(CRUDError.From(fe.Message));
            }
            catch (LeafDbException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Could not create SpecializationGroup:{@SpecializationGroup} Error:{Error}", dto, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<SpecializationGroupDeleteResponse>> Delete(int id)
        {
            try
            {
                var result = await sgService.Delete(id);
                if (!result.Ok)
                {
                    return Conflict(SpecializationGroupDeleteResponse.From(result));
                }
                return Ok();
            }
            catch (LeafDbException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Could not delete SpecializationGroup. Id:{Id} Error:{Error}", id, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
