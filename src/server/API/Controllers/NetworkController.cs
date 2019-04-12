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
using Microsoft.Extensions.Options;
using Services;
using Model.Network;
using Model.Options;
using API.DTO.Network;
using Model.Authorization;
using Services.Network;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Produces("application/json")]
    [Route("api/network")]
    public class NetworkController : Controller
    {
        readonly INetworkEndpointService endpointService;
        readonly ILogger<NetworkController> log;
        public NetworkController(ILogger<NetworkController> logger, INetworkEndpointService endpointService)
        {
            log = logger;
            this.endpointService = endpointService;
        }

        [Authorize(Policy = Access.Institutional)]
        [HttpGet("respondents")]
        public async Task<ActionResult<NetworkIdentityEndpointsDTO>> Respondents()
        {
            try
            {
                var idEndpoints = await endpointService.AllWithIdentityAsync();
                return Ok(new NetworkIdentityEndpointsDTO(idEndpoints));
            }
            catch (Exception ex)
            {
                log.LogError("Could not retrieve respondents. Error:{Error}", ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("identity")]
        public async Task<ActionResult<NetworkIdentity>> Identity()
        {
            try
            {
                var identity = await endpointService.GetIdentityAsync();
                return Ok(identity);
            }
            catch (Exception ex)
            {
                log.LogError("Could not retrieve network identity. Error:{Error}", ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}