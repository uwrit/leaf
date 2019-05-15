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

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/conceptevent")]
    public class AdminConceptEventController : Controller
    {
        readonly ILogger<AdminConceptEventController> logger;
        readonly IAdminConceptEventService evService;

        public AdminConceptEventController(ILogger<AdminConceptEventController> logger, IAdminConceptEventService evService)
        {
            this.logger = logger;
            this.evService = evService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConceptEvent>>> Get()
        {
            try
            {
                var evs = await evService.Get();
                return Ok(evs);
            }
            catch (Exception e)
            {
                logger.LogError("Could not get ConceptEvents. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] ConceptEvent conceptEvent)
        {
            try
            {
                if (conceptEvent == null)
                {
                    return BadRequest(CRUDError.From("ConceptEvent is missing."));
                }
                if (string.IsNullOrWhiteSpace(conceptEvent.UiDisplayEventName))
                {
                    return BadRequest(CRUDError.From("ConceptEvent.UiDisplayEventName is required."));
                }
                conceptEvent.Id = id;

                var updated = await evService.Update(conceptEvent);
                if (updated == null)
                {
                    return NotFound();
                }
                return Ok(updated);
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Could not update ConceptEvent:{@ConceptEvent}. Error:{Error}", conceptEvent, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult<ConceptEvent>> Create([FromBody] ConceptEvent conceptEvent)
        {
            try
            {
                if (conceptEvent == null)
                {
                    return BadRequest(CRUDError.From("ConceptEvent is missing."));
                }
                if (string.IsNullOrWhiteSpace(conceptEvent.UiDisplayEventName))
                {
                    return BadRequest(CRUDError.From("ConceptEvent.UiDisplayEventName is required."));
                }

                var created = await evService.Create(conceptEvent);
                return Ok(created);
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Could not create ConceptEvent:{@ConceptEvent}. Error:{Error}", conceptEvent, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await evService.Delete(id);
                if (!result.Ok)
                {
                    return Conflict(ConceptEventDeleteResponse.From(result));
                }
                return Ok();
            }
            catch (Exception ex)
            {
                logger.LogError("Could not delete ConceptEvent. Id:{Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}