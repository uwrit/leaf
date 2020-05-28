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
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Import;
using API.DTO.Import;
using Model.Options;
using Microsoft.Extensions.Options;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Produces("application/json")]
    [Route("api/import")]
    public class ImportController : Controller
    {
        readonly ILogger<ImportController> log;
        readonly ImportOptions importOptions;

        public ImportController(ILogger<ImportController> logger, IOptions<ImportOptions> importOptions)
        {
            log = logger;
            this.importOptions = importOptions.Value;

        }

        [HttpGet("options")]
        public ActionResult<ImportOptionsDTO> Import()
        {
            try
            {
                var opts = new ImportOptionsDTO(importOptions);
                return Ok(opts);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to retrieve export options. Error:{Error}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("metadata")]
        public async Task<ActionResult<IEnumerable<ImportMetadata>>> GetAllMetadata([FromServices] DataImporter importer)
        {
            try
            {
                if (!importOptions.REDCap.Enabled)
                {
                    return NotFound();
                }
                var meta = await importer.GetAllImportMetadata();
                return Ok(meta);
            }
            catch (Exception ex)
            {
                log.LogError("Failed get all import metadata. Error:{Error}", ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("metadata/{id}")]
        public async Task<ActionResult<ImportMetadata>> GetMetadata(string id, [FromServices] DataImporter importer)
        {
            try
            {
                if (!importOptions.REDCap.Enabled)
                {
                    return NotFound();
                }
                ImportMetadata meta = null;
                var isGuid = Guid.TryParse(id, out var guidId);
                if (isGuid)
                {
                    // Get by leaf internal Id
                    meta = await importer.GetImportMetadata(guidId);
                }
                else
                {
                    // Get by sourceId
                    meta = await importer.GetImportMetadata(id);
                }

                if (meta == null)
                {
                    return NotFound();
                }

                return Ok(meta);
            }
            catch (Exception ex)
            {
                log.LogError("Failed get import metadata. Error:{Error}", ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost("metadata")]
        public async Task<ActionResult<ImportMetadata>> CreateImportMetadata([FromBody] ImportMetadataDTO dto, [FromServices] DataImporter importer)
        {
            try
            {
                if (!importOptions.REDCap.Enabled)
                {
                    return NotFound();
                }
                var imported = await importer.CreateImportMetadata(dto);
                return Ok(imported);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to create import metadata. ImportMetadata:{dto} Error:{Error}", dto, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPut("metadata")]
        public async Task<ActionResult<ImportMetadata>> UpdateImportMetadata([FromBody] ImportMetadataDTO dto, [FromServices] DataImporter importer)
        {
            try
            {
                if (!importOptions.REDCap.Enabled)
                {
                    return NotFound();
                }
                var updated = await importer.UpdateImportMetadata(dto);
                if (updated == null)
                {
                    return NotFound();
                }

                return Ok(updated);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to update import metadata. ImportMetadata:{dto} Error:{Error}", dto, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("metadata/{id}")]
        public async Task<ActionResult<ImportMetadata>> DeleteImportMetadata(Guid id, [FromServices] DataImporter importer)
        {
            try
            {
                if (!importOptions.REDCap.Enabled)
                {
                    return NotFound();
                }
                var deleted = await importer.DeleteImportMetadata(id);
                if (deleted == null)
                {
                    return NotFound();
                }

                return Ok(deleted);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to delete import metadata. ImportMetadataId:{id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost("data/{id}")]
        public async Task<ActionResult<ImportDataResultDTO>> ImportData(Guid id, [FromBody] ImportDataRecordDTO data, [FromServices] DataImporter importer)
        {
            try
            {
                if (!importOptions.REDCap.Enabled)
                {
                    return NotFound();
                }
                var upserted = await importer.ImportData(id, data.Records.Select(r => r.ToImportRecord()));
                if (upserted == null)
                {
                    return NotFound();
                }

                return Ok(new ImportDataResultDTO(upserted));
            }
            catch (Exception ex)
            {
                log.LogError("Failed to upsert import records. ImportMetadataId:{id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("data/{id}")]
        public async Task<ActionResult<IEnumerable<ImportRecordDTO>>> GetImportData(Guid id, [FromServices] DataImporter importer)
        {
            try
            {
                // TODO (ndobb): Determine policy and workflow for retrieving imported data, especially if PHI.
                return NotFound();
            }
            catch (Exception ex)
            {
                log.LogError("Failed to get import records. ImportMetadataId:{id} Error:{Error}", id, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}