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
using Model.Error;
using Services;
using API.DTO.Admin;
using Model.Admin.Compiler;
using API.DTO.Admin.Compiler;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/conceptevent")]
    public class AdminConceptEventController : Controller
    {
        readonly ILogger<AdminConceptEventController> logger;
        readonly AdminConceptEventManager manager;

        public AdminConceptEventController(ILogger<AdminConceptEventController> logger, AdminConceptEventManager manager)
        {
            this.logger = logger;
            this.manager = manager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConceptEvent>>> Get()
        {
            try
            {
                var evs = await manager.GetAsync();
                return Ok(evs);
            }
            catch (Exception e)
            {
                logger.LogError("Failed to get ConceptEvents. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] ConceptEvent conceptEvent)
        {
            try
            {
                if (conceptEvent != null)
                {
                    conceptEvent.Id = id;
                }

                var updated = await manager.UpdateAsync(conceptEvent);
                if (updated == null)
                {
                    return NotFound();
                }
                return Ok(updated);
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid update ConceptEvent model. Model:{@Model} Error:{Error}", conceptEvent, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(ConceptEvent)} is missing or incomplete."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to update ConceptEvent:{@ConceptEvent}. Error:{Error}", conceptEvent, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult<ConceptEvent>> Create([FromBody] ConceptEvent conceptEvent)
        {
            try
            {
                var created = await manager.CreateAsync(conceptEvent);
                return Ok(created);
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid create ConceptEvent model. Model:{@Model} Error:{Error}", conceptEvent, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(ConceptEvent)} is missing or incomplete."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to create ConceptEvent:{@ConceptEvent}. Error:{Error}", conceptEvent, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await manager.DeleteAsync(id);
                if (!result.Ok)
                {
                    return Conflict(ConceptEventDeleteResponse.From(result));
                }
                return Ok();
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to delete ConceptEvent. Id:{Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}