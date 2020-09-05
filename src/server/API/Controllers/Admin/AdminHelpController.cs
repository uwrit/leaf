// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using API.DTO.Admin;
using Model.Authorization;
using Model.Error;
using Model.Admin.Compiler;

namespace API.Controllers.Admin
{
    [Authorize(Policy = Role.Admin)]
    [Produces("application/json")]
    [Route("api/admin/help")]
    public class AdminHelpController : Controller
    {
        readonly ILogger<AdminHelpController> logger;
        readonly AdminHelpManager manager;

        public AdminHelpController(
            AdminHelpManager manager,
            ILogger<AdminHelpController> logger)
        {
            this.logger = logger;
            this.manager = manager;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<AdminHelp>> Get(Guid id)
        {
            try
            {
                // TODO(mh2727) 
            }
            catch (Exception e)
            {
                logger.LogError("Failed to get help page. Id:{id} Error:{Error}", id, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AdminHelpDTO>> Update(Guid id, [FromBody] AdminHelpDTO o)
        {
            try
            {
                // TODO(mh2727) 
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid update help page. Error:{Error}", ae.Message);
                //return BadRequest()
            }
            catch (Exception e)
            {
                logger.LogError("Failed to update help page. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult<AdminHelpDTO>> Create([FromBody] AdminHelpDTO o)
        {
            try
            {
                // TODO(mh2727)
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid create help page. Error:{Error}", ae.Message);
                //return BadRequest()
            }
            catch (Exception e)
            {
                logger.LogError("Failed to create help page. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        // Deletes help page and content
        [HttpDelete("{id}")]
        public async Task<ActionResult<HelpPageDeleteResponse>> Delete(Guid id)
        {
            try
            {
                // TODO(mh2727) 
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to delete help page. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
