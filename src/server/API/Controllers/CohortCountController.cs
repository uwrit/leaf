// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using API.DTO.Cohort;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Cohort;
using Model.Compiler;
using Model.Error;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Route("api/cohort/count")]
    public class CohortCountController : Controller
    {
        readonly ILogger<CohortCountController> log;

        public CohortCountController(ILogger<CohortCountController> logger)
        {
            log = logger;
        }

        [HttpPost]
        public async Task<ActionResult<CohortCountDTO>> Count(
            [FromBody] PatientCountQueryDTO patientCountQuery,
            [FromServices] CohortCounter counter,
            CancellationToken cancelToken)
        {
            try
            {
                var cohort = await counter.Count(patientCountQuery, cancelToken);
                var resp = new CohortCountDTO(cohort);
                if (!cohort.ValidationContext.PreflightPassed)
                {
                    return BadRequest(resp);
                }

                return Ok(resp);
            }
            catch (ArgumentNullException ane)
            {
                log.LogError("Missing argument. Error:{Error}", ane.Message);
                return BadRequest();
            }
            catch (OperationCanceledException)
            {
                log.LogInformation("Request cancelled.");
                return NoContent();
            }
            catch (LeafCompilerException ce)
            {
                log.LogError("Unrecoverable validation error in query. Error:{Error}", ce.Message);
                return BadRequest();
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to execute query. Error:{Error}", ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}