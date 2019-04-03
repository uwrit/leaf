// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using DTO.Export;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Export;
using Model.Options;
using Services.Export;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Authorize(Policy = Access.Institutional)]
    [Route("api/export")]
    public class ExportController : Controller
    {
        readonly ILogger<ExportController> log;
        readonly IOptions<ExportOptions> exportOptions;

        public ExportController(ILogger<ExportController> logger, IOptions<ExportOptions> exportOptions)
        {
            this.log = logger;
            this.exportOptions = exportOptions;
        }

        [HttpGet("options")]
        public ActionResult<ExportOptionsDTO> Export()
        {
            try
            {
                var opts = new ExportOptionsDTO(exportOptions.Value);
                return Ok(opts);
            }
            catch (Exception ex)
            {
                log.LogError("Could not retrieve export options. Error:{Error}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("redcap/version")]
        public async Task<ActionResult<string>> GetREDCapVersion([FromServices] IREDCapExportService exportService)
        {
            try
            {
                var version = await exportService.GetREDCapVersion();
                if (version.Split(' ').Length != 1)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
                return Ok(version);
            }
            catch (ExportException ee)
            {
                return StatusCode(ee.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Could not fetch REDCap version. Error:{Error}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost("redcap/project/create")]
        public async Task<ActionResult<string>> CreateREDCapProjec([FromBody] REDCapProjectRequest project, [FromServices] IREDCapExportService exportService)
        {
            try
            {
                var token = await exportService.CreateProject(project);
                if (token.Split(' ').Length != 1)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError);
                }
                return Ok(token);
            }
            catch (ExportException ee)
            {
                return StatusCode(ee.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Could not create REDCap project. Error:{Error}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        //[HttpPost("redcap/project/failure")]
        //public ActionResult LogREDCapProjectFailure([FromBody] string token, [FromServices] IREDCapExportService exportService)
        //{
        //    try
        //    {
        //        // Do something with token
        //        return Ok();
        //    }
        //    catch (Exception ex)
        //    {
        //        log.LogError("Could not log REDCap project failure. Error:{Error}", ex.Message);
        //        return StatusCode(StatusCodes.Status500InternalServerError);
        //    }
        //}
    }
}
