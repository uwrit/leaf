// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
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
    [Route("api/admin/concept")]
    public class AdminConceptController : Controller
    {
        readonly ILogger<AdminConceptController> logger;
        readonly IAdminConceptService cService;

        public AdminConceptController(ILogger<AdminConceptController> logger, IAdminConceptService cService)
        {
            this.logger = logger;
            this.cService = cService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Concept>> Get(Guid id)
        {
            try
            {
                var concept = await cService.Get(id);
                return Ok(new ConceptDTO(concept));
            }
            catch (Exception ex)
            {
                logger.LogError("Could not get concept. Id:{Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}