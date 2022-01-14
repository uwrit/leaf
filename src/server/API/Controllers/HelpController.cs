// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Model.Authorization;
using Microsoft.AspNetCore.Authorization;
using API.DTO.Compiler;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using Model.Compiler;
using Model.Error;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Route("api/helppages")]
    public class HelpController : Controller
    {
        readonly ILogger<HelpController> logger;
        readonly HelpPageManager manager;

        public HelpController(ILogger<HelpController> logger, HelpPageManager manager)
        {
            this.logger = logger;
            this.manager = manager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<HelpPageDTO>>> GetHelpPages()
        {
            try
            {
                var pages = await manager.GetHelpPagesAsync();
                return Ok(pages.Select(p => new HelpPageDTO(p)));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception e)
            {
                logger.LogError("Failed to fetch help pages. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("categories")]
        public async Task<ActionResult<IEnumerable<HelpPageCategoryDTO>>> GetHelpPageCategories()
        {
            try
            {
                var cats = await manager.GetHelpPageCategoriesAsync();
                return Ok(cats.Select(c => new HelpPageCategoryDTO(c)));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception e)
            {
                logger.LogError("Failed to fetch help page categories. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("{pageid}/content")]
        public async Task<ActionResult<IEnumerable<HelpPageContentDTO>>> GetHelpPageContent(Guid pageId)
        {
            try
            {
                var content = await manager.GetHelpPageContentAsync(pageId);
                return Ok(content.Select(c => new HelpPageContentDTO(c)));
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception e)
            {
                logger.LogError("Failed to fetch help page content. PageId:{PageId} Error:{Error}", pageId, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}