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

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Authorize(Policy = Access.Institutional)]
    [Route("api/export")]
    public class ExportController : Controller
    {
        readonly ILogger<ExportController> log;
        readonly ExportOptions exportOptions;

        public ExportController(ILogger<ExportController> logger, IOptions<ExportOptions> exportOptions)
        {
            this.log = logger;
            this.exportOptions = exportOptions.Value;
        }

        [HttpGet("options")]
        public ActionResult<ExportOptionsDTO> Export()
        {
            try
            {
                var opts = new ExportOptionsDTO(exportOptions);
                return Ok(opts);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to retrieve export options. Error:{Error}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
