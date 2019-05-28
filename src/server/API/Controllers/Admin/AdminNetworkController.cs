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
using Model.Network;
using Model.Authorization;
using Model.Error;
using Model.Admin.Network;
using API.DTO.Admin.Network;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/network")]
    public class AdminNetworkController : Controller
    {
        readonly ILogger<AdminNetworkController> logger;
        readonly AdminNetworkEndpointManager manager;

        public AdminNetworkController(
            ILogger<AdminNetworkController> logger,
            AdminNetworkEndpointManager manager)
        {
            this.logger = logger;
            this.manager = manager;
        }

        [HttpPut("endpoint/{id}")]
        public async Task<ActionResult<NetworkEndpointDTO>> UpdateEndpoint(int id, [FromBody] NetworkEndpointDTO state)
        {
            try
            {
                if (state != null)
                {
                    state.Id = id;
                }

                var e = state.NetworkEndpoint();
                var swap = await manager.UpdateEndpointAsync(e);
                var payload = swap.New.NetworkEndpointDTO();

                return Ok(payload);
            }
            catch (UriFormatException ue)
            {
                logger.LogError("Invalid address in update NetworkEndpoint model. Model:{@Model} Error:{Error}", state, ue.Message);
                return BadRequest(CRUDError.From($"{nameof(NetworkEndpointDTO)} address is malformed."));
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid update NetworkEndpoint model. Model:{@Model} Error:{Error}", state, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(NetworkEndpointDTO)} is missing, incomplete, or malformed."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to update NetworkEndpoint. Model:{@Model} Error:{Error}", state, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost("endpoint")]
        public async Task<ActionResult<NetworkEndpointDTO>> CreateEndpoint([FromBody] NetworkEndpointDTO state)
        {
            try
            {
                var e = state.NetworkEndpoint();
                var created = await manager.CreateEndpointAsync(e);
                var payload = created.NetworkEndpointDTO();

                return Ok(payload);
            }
            catch (UriFormatException ue)
            {
                logger.LogError("Invalid address in create NetworkEndpoint model. Model:{@Model} Error:{Error}", state, ue.Message);
                return BadRequest(CRUDError.From($"{nameof(NetworkEndpointDTO)} address is malformed."));
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid create NetworkEndpoint model. Model:{@Model} Error:{Error}", state, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(NetworkEndpointDTO)} is missing, incomplete, or malformed."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to create NetworkEndpoint. Model:{@Model} Error:{Error}", state, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("endpoint/{id}")]
        public async Task<ActionResult> DeleteEndpoint(int id)
        {
            try
            {
                var deleted = await manager.DeleteEndpointAsync(id);
                if (deleted == null)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to delete NetworkEndpoint. Id:{@Id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult> UpsertIdentity([FromBody] NetworkIdentity identity)
        {
            try
            {
                var result = await manager.UpdateIdentityAsync(identity);
                return Ok(result.New);
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid update NetworkIdentity model. Model:{@Model} Error:{Error}", identity, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(NetworkIdentity)} is missing, incomplete, or malformed."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to updated NetworkIdentity. Model:{@Model} Error:{Error}", identity, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
