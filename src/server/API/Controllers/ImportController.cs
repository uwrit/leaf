// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using API.DTO.Import;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Import;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Produces("application/json")]
    [Route("api/import")]
    public class ImportController : Controller
    {
        readonly ILogger<ImportController> log;

        public ImportController(ILogger<ImportController> logger)
        {
            log = logger;
        }

        [HttpPost("import")]
        public async Task<ActionResult<ImportMetadata>> CreateImport([FromBody] ImportMetadataDTO dto)
        {
            try
            {
                var hints = await searchEngine.GetHintsAsync(rootParentId, term);
                return Ok(hints);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to create . Term:{Term} Error:{Error}", term, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}