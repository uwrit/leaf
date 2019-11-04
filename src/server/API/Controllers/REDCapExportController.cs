// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using API.DTO.Export;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Export;
using Model.Options;
using Services.Export;
using API.Controllers.Base;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Authorize(Policy = Access.Institutional)]
    [Route("api/export/redcap")]
    public class REDCapExportController : MaybeController<REDCapExportOptions>
    {
        readonly ILogger<REDCapExportController> log;

        public REDCapExportController(
            ILogger<REDCapExportController> log,
            IOptions<REDCapExportOptions> opts) : base(opts)
        {
            this.log = log;
        }

        [HttpGet("version")]
        public async Task<ActionResult<string>> GetVersion([FromServices] IREDCapExportService exportService)
        {
            try
            {
                var version = await exportService.GetREDCapVersion();
                return Ok(version);
            }
            catch (ExportException ee)
            {
                return StatusCode(ee.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to fetch REDCap version. Error:{Error}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost("project/create")]
        public async Task<ActionResult<string>> CreateProject([FromBody] REDCapProjectRequest project, [FromServices] IREDCapExportService exportService)
        {
            try
            {
                var token = await exportService.CreateProject(project);
                return Ok(token);
            }
            catch (ExportException ee)
            {
                return StatusCode(ee.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to create REDCap project. Error:{Error}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
