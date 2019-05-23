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
using Model.Validation;
using Model.Error;
using API.DTO.Admin;
using Model.Admin.Compiler;
using API.DTO.Admin.Compiler;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/sqlset")]
    public class AdminSqlSetController : Controller
    {

        readonly ILogger<AdminSqlSetController> logger;
        readonly AdminConceptSqlSetManager manager;

        public AdminSqlSetController(ILogger<AdminSqlSetController> logger, AdminConceptSqlSetManager manager)
        {
            this.logger = logger;
            this.manager = manager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConceptSqlSet>>> Get()
        {
            try
            {
                var sets = await manager.GetAsync();
                return Ok(sets);
            }
            catch (Exception e)
            {
                logger.LogError("Failed to get ConceptSqlSets. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] ConceptSqlSet conceptSqlSet)
        {
            try
            {
                if (conceptSqlSet != null)
                {
                    conceptSqlSet.Id = id;
                }

                var updated = await manager.UpdateAsync(conceptSqlSet);
                if (updated == null)
                {
                    return NotFound();
                }
                return Ok(updated);
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid update ConceptSqlSet model. Model:{@Model} Error:{Error}", conceptSqlSet, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(ConceptSqlSet)} is missing or incomplete."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to update ConceptSqlSet:{@ConceptSqlSet}. Error:{Error}", conceptSqlSet, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult<ConceptSqlSet>> Create([FromBody] ConceptSqlSet conceptSqlSet)
        {
            try
            {
                var created = await manager.CreateAsync(conceptSqlSet);
                return Ok(created);
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid create ConceptSqlSet model. Model:{@Model} Error:{Error}", conceptSqlSet, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(ConceptSqlSet)} is missing or incomplete."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to create ConceptSqlSet:{@ConceptSqlSet}. Error:{Error}", conceptSqlSet, e.ToString());
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
                    return Conflict(ConceptSqlSetDeleteResponse.From(result));
                }
                return Ok();
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to delete ConceptSqlSet. Id:{Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
