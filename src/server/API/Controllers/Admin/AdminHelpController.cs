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
    [Route("api/admin/helppages")]
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

        // Get all help pages.
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AdminHelpPageTitleDTO>>> GetHelpPages()
        {
            try
            {
                var pages = await manager.GetHelpPagesAsync();
                return Ok(pages.Select(p => new AdminHelpPageTitleDTO(p)));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to get help pages. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        // Get help page categories.
        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<AdminHelpPageCategoryDTO>>> GetHelpPageCategories()
        {
            try
            {
                var cats = await manager.GetHelpPageCategoriesAsync();
                return Ok(cats.Select(c => new AdminHelpPageCategoryDTO(c)));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to get help page categories. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        // Get a single help page and its content.
        [HttpGet("{pageid}/content")]
        public async Task<ActionResult<IEnumerable<AdminHelpPageContentDTO>>> GetHelpPageContent(Guid pageId)
        {
            try
            {
                var content = await manager.GetHelpPageContentAsync(pageId);
                return Ok(content.Select(c => new AdminHelpPageContentDTO(c)));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to get help page content. PageId:{pageId} Error:{Error}", pageId, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        // Create help page.
        [HttpPost]
        public async Task<ActionResult<AdminHelpPageDTO>> Create([FromBody] AdminHelpPageDTO p)
        {
            try
            {
                var page = p.HelpPage();
                var created = await manager.CreateAsync(page);
                return Ok(new AdminHelpPageDTO(created));
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid create help page. Page:{@Page} Error:{Error}", p, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(AdminHelpPageDTO)} is missing or incomplete."));
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

        // Update help page.
        [HttpPut("{pageid}")]
        public async Task<ActionResult<AdminHelpPageDTO>> Update([FromBody] AdminHelpPageDTO p)
        {
            try
            {
                var page = p.HelpPage();
                var updated = await manager.UpdateAsync(page);
                return Ok(new AdminHelpPageDTO(updated));
            }
            catch (ArgumentException ae)
            {
                logger.LogError("Invalid update help page. Page:{@Page} Error:{Error}", p, ae.Message);
                return BadRequest(CRUDError.From($"{nameof(AdminHelpPageDTO)} is missing or incomplete."));
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

        // Delete help page.
        [HttpDelete("{pageid}")]
        public async Task<ActionResult<AdminHelpPageDTO>> Delete(Guid pageId)
        {
            try
            {
                var deleted = await manager.DeleteAsync(pageId);
                return Ok(new AdminHelpPageDTO(deleted));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode, CRUDError.From(le.Message));
            }
            catch (Exception e)
            {
                logger.LogError("Failed to delete help page. PageId:{PageId} Error:{Error}", pageId, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}