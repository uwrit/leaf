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
using Services;
using API.DTO.Admin;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/sqlset")]
    public class AdminSqlSetController : Controller
    {

        readonly ILogger<AdminSqlSetController> logger;
        readonly IAdminConceptSqlSetService setService;

        public AdminSqlSetController(ILogger<AdminSqlSetController> logger, IAdminConceptSqlSetService setService)
        {
            this.logger = logger;
            this.setService = setService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConceptSqlSet>>> Get()
        {
            try
            {
                var sets = await setService.Get();
                return Ok(sets);
            }
            catch (Exception e)
            {
                logger.LogError("Could not get ConceptSqlSets. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] ConceptSqlSet conceptSqlSet)
        {
            try
            {
                if (conceptSqlSet == null)
                {
                    return BadRequest(CRUDError.From("ConceptSqlSet is missing."));
                }
                if (string.IsNullOrWhiteSpace(conceptSqlSet.SqlSetFrom))
                {
                    return BadRequest(CRUDError.From("ConceptSqlSet.SqlSetFrom is required."));
                }
                conceptSqlSet.Id = id;

                var updated = await setService.Update(conceptSqlSet);
                if (updated == null)
                {
                    return NotFound();
                }
                return Ok(updated);
            }
            catch (LeafDbException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Could not update ConceptSqlSet:{@ConceptSqlSet}. Error:{Error}", conceptSqlSet, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult<ConceptSqlSet>> Create([FromBody] ConceptSqlSet conceptSqlSet)
        {
            try
            {
                if (conceptSqlSet == null)
                {
                    return BadRequest(CRUDError.From("ConceptSqlSet is missing."));
                }
                if (string.IsNullOrWhiteSpace(conceptSqlSet.SqlSetFrom))
                {
                    return BadRequest(CRUDError.From("ConceptSqlSet.SqlSetFrom is required."));
                }

                var created = await setService.Create(conceptSqlSet);
                return Ok(created);
            }
            catch (LeafDbException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Could not create ConceptSqlSet:{@ConceptSqlSet}. Error:{Error}", conceptSqlSet, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await setService.Delete(id);
                if (!result.Ok)
                {
                    return Conflict(ConceptSqlSetDeleteResponse.From(result));
                }
                return Ok();
            }
            catch (Exception ex)
            {
                logger.LogError("Could not delete ConceptSqlSet. Id:{Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
