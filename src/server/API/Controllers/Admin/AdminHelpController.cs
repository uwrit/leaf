// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Error;
using Model.Admin.Compiler;
using API.DTO.Admin;
using API.DTO.Admin.Compiler;

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
        public async Task<ActionResult<AdminHelpPageContentSql>> Get(int id)
        {
            try
            {
                var page = await manager.GetAsync(id);
                return Ok(new AdminHelpContentDTO(page));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to get help page. Id:{id} Error:{Error}", id, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<AdminHelpPageCreateUpdateSql>> Update(int id, [FromBody] AdminHelpPageCreateUpdateSql p)
        {
            try
            {
                if (p != null)
                {
                    p.PageId = id;
                }

                var updated = await manager.UpdateAsync(p);
                return Ok(new AdminHelpCreateUpdateDTO(updated));
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid update help page. Page:{@Page} Error:{Error}", p, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(AdminHelpPageCreateUpdateSql)} is missing or incomplete."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to update help page. Page:{@Page} Error:{Error}", p, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost]
        public async Task<ActionResult<AdminHelpPageCreateUpdateSql>> Create([FromBody] AdminHelpPageCreateUpdateSql p)
        {
            try
            {
                var created = await manager.CreateAsync(p);
                return Ok(new AdminHelpCreateUpdateDTO(created));
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid create help page. Page:{@Page} Error:{Error}", p, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(AdminHelpPageCreateUpdateSql)} is missing or incomplete."));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to create help page. Page:{@Page} Error:{Error}", p, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        //Deletes help page and content
       [HttpDelete("{id}")]
        public async Task<ActionResult<int?>> Delete(int id)
        {
            try
            {
                var deleted = await manager.DeleteAsync(id);
                if (!deleted.HasValue)
                {
                    return NotFound();
                }
                return Ok();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to delete help page. Id:{Id} Error:{Error}", id, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
