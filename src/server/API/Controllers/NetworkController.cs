// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using API.DTO.Network;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Network;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Produces("application/json")]
    [Route("api/network")]
    public class NetworkController : Controller
    {
        readonly NetworkEndpointProvider provider;
        readonly ILogger<NetworkController> log;
        public NetworkController(ILogger<NetworkController> logger, NetworkEndpointProvider provider)
        {
            log = logger;
            this.provider = provider;
        }

        [Authorize(Policy = Access.Institutional)]
        [HttpGet("responders")]
        public async Task<ActionResult<NetworkIdentityRespondersDTO>> Responders()
        {
            try
            {
                var idEndpoints = await provider.GetEndpointsWithIdentityAsync();
                return Ok(new NetworkIdentityRespondersDTO(idEndpoints));
            }
            catch (Exception ex)
            {
                log.LogError("Could not retrieve responders. Error:{Error}", ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("identity")]
        public async Task<ActionResult<NetworkIdentity>> Identity()
        {
            try
            {
                var identity = await provider.GetIdentityAsync();
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