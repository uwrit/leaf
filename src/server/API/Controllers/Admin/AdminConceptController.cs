// Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
    [Route("api/admin/concept")]
    public class AdminConceptController : Controller
    {
        readonly ILogger<AdminConceptController> logger;
        readonly AdminConceptManager manager;

        public AdminConceptController(ILogger<AdminConceptController> logger, AdminConceptManager manager)
        {
            this.logger = logger;
            this.manager = manager;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AdminConcept>> Get(Guid id)
        {
            try
            {
                var concept = await manager.GetAsync(id);
                return Ok(new AdminConceptDTO(concept));
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to get concept. Id:{Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AdminConceptDTO>> Update(Guid id, [FromBody] AdminConceptDTO o)
        {
            try
            {
                if (o != null)
                {
                    o.Id = id;
                }

                var c = o.Concept();
                var updated = await manager.UpdateAsync(c);
                return Ok(new AdminConceptDTO(updated));
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid update Concept model. Model:{@Model} Error:{Error}", o, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(AdminConcept)} is missing or incomplete."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to update concept. Concept:{@Concept} Error:{Error}", o, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult<AdminConceptDTO>> Create([FromBody] AdminConceptDTO o)
        {
            try
            {
                var c = o.Concept();
                var updated = await manager.CreateAsync(c);
                return Ok(new AdminConceptDTO(updated));
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid create Concept model. Model:{@Model} Error:{Error}", o, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(AdminConcept)} is missing or incomplete."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to create concept. Concept:{@Concept}, Error:{Error}", o, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ConceptDeleteResult>> Delete(Guid id)
        {
            try
            {
                var result = await manager.DeleteAsync(id);
                if (!result.Ok)
                {
                    return Conflict(new ConceptDeleteResponse(result));
                }
                return Ok();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to delete concept. Id:{Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}