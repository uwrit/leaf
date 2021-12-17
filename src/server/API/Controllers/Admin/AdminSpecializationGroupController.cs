// Copyright (c) 2022, UW Medicine Research IT, University of Washington
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
using Model.Error;
using Services.Admin;
using Model.Admin;
using API.DTO.Admin;
using Services;
using Model.Admin.Compiler;
using API.DTO.Admin.Compiler;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/specializationgroup")]
    public class AdminSpecializationGroupController : Controller
    {
        readonly ILogger<AdminSpecializationGroupController> logger;
        readonly AdminSpecializationGroupManager manager;

        public AdminSpecializationGroupController(ILogger<AdminSpecializationGroupController> logger, AdminSpecializationGroupManager manager)
        {
            this.logger = logger;
            this.manager = manager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SpecializationGroupDTO>>> Get()
        {
            try
            {
                var groups = await manager.GetAsync();
                return Ok(groups.Select(SpecializationGroupDTO.From));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to get SpecializationGroups. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<SpecializationGroupDTO>> Update(int id, [FromBody] SpecializationGroupDTO dto)
        {
            try
            {
                if (dto != null)
                {
                    dto.Id = id;
                }

                var group = dto.SpecializationGroup();
                var updated = await manager.UpdateAsync(group);
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
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid update SpecializationGroup model. Model:{@Model} Error:{Error}", dto, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(SpecializationGroup)} is missing or incomplete."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to update SpecializationGroup:{@SpecializationGroup} Error:{Error}", dto, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult<SpecializationGroupDTO>> Create([FromBody] SpecializationGroupDTO dto)
        {
            try
            {
                var group = dto.SpecializationGroup();
                var created = await manager.CreateAsync(group);
                return Ok(SpecializationGroupDTO.From(created));
            }
            catch (FormatException fe)
            {
                logger.LogError("Malformed SpecializationGroup:{@SpecializationGroup} Error:{Error}", dto, fe.Message);
                return BadRequest(CRUDError.From(fe.Message));
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid create SpecializationGroup model. Model:{@Model} Error:{Error}", dto, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(SpecializationGroup)} is missing or incomplete."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to create SpecializationGroup:{@SpecializationGroup} Error:{Error}", dto, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<SpecializationGroupDeleteResponse>> Delete(int id)
        {
            try
            {
                var result = await manager.DeleteAsync(id);
                if (!result.Ok)
                {
                    return Conflict(SpecializationGroupDeleteResponse.From(result));
                }
                return Ok();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to delete SpecializationGroup. Id:{Id} Error:{Error}", id, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
