// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTO.Compiler;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Search;

namespace API.Controllers
{
    [Route("api/visualization")]
    public class VisualizationController : Controller
    {
        readonly ILogger<VisualizationController> log;
        public VisualizationController(ILogger<VisualizationController> logger)
        {
            log = logger;
        }

        [Authorize(Policy = Access.Institutional)]
        [Authorize(Policy = TokenType.Access)]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DatasetQueryDTO>>> Get([FromServices] DatasetQueryProvider provider)
        {
            try
            {
                var queries = await provider.GetQueriesAsync();
                var dtos = queries.Select(q => new DatasetQueryDTO(q));
                return Ok(dtos);
            }
            catch (Exception e)
            {
                log.LogError("Failed to get visualization pages. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}