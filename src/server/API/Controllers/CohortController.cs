// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using API.DTO.Cohort;
using API.DTO.Compiler;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Cohort;
using Model.Compiler;
using Model.Validation;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Route("api/cohort")]
    public class CohortController : Controller
    {
        readonly ILogger<CohortController> log;

        public CohortController(ILogger<CohortController> logger)
        {
            log = logger;
        }

        [HttpPost("count")]
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
            catch (InvalidOperationException ie)
            {
                log.LogError("Unrecoverable validation error in query. Error:{Error}", ie.Message);
                return BadRequest();
            }
            catch (Exception ex)
            {
                log.LogError("Could not execute query. Error:{Error}", ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("{queryid}/demographics")]
        public async Task<ActionResult<Demographic>> Demographics(
            string queryid,
            [FromServices] DemographicProvider provider,
            CancellationToken cancelToken)
        {
            try
            {
                var queryRef = new QueryRef(queryid);
                var result = await provider.GetDemographicsAsync(queryRef, cancelToken);
                if (result.Context.State != CompilerContextState.Ok)
                {
                    return NotFound(new CompilerErrorDTO(result.Context.State));
                }

                return Ok(result.Demographics);
            }
            catch (ArgumentNullException ane)
            {
                log.LogError("Missing argument. Error:{Error}", ane.Message);
                return BadRequest();
            }
            catch (FormatException fe)
            {
                log.LogWarning("Malformed query identifiers. QueryId:{QueryID} Error:{Error}", queryid, fe.Message);
                return BadRequest("QueryID is malformed.");
            }
            catch (OperationCanceledException)
            {
                log.LogInformation("Request cancelled. QueryID:{QueryID}", queryid);
                return NoContent();
            }
            catch (LeafRPCException lde)
            {
                return StatusCode(lde.StatusCode);
            }
            catch (LeafCompilerException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
            catch (Exception ex)
            {
                log.LogError("Could not fetch demographics. QueryID:{QueryID} Error:{Error}", queryid, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("{queryid}/dataset")]
        public async Task<ActionResult<DatasetDTO>> Dataset(
            string queryid,
            [FromQuery] string datasetid,
            [FromQuery] Shape shape,
            [FromQuery] long? early,
            [FromQuery] long? late,
            [FromServices] DatasetProvider provider,
            CancellationToken cancelToken)
        {
            try
            {
                var queryref = new QueryRef(queryid);
                var datasetref = new DatasetQueryRef(datasetid, shape);

                var result = await provider.GetDatasetAsync(queryref, datasetref, cancelToken, early, late);

                switch (result.Context.State)
                {
                    case CompilerContextState.DatasetShapeMismatch:
                        return BadRequest(new CompilerErrorDTO(result.Context.State));
                    case CompilerContextState.DatasetNotFound:
                    case CompilerContextState.QueryNotFound:
                        return NotFound(new CompilerErrorDTO(result.Context.State));
                }

                return Ok(new DatasetDTO(result.Dataset));
            }
            catch (FormatException fe)
            {
                log.LogWarning("Malformed dataset identifiers. Error:{Error}", fe.Message);
                return BadRequest();
            }
            catch (LeafPreflightException lpe)
            {
                log.LogInformation("Dataset query failed preflight check. Error:{Error}", lpe.Message);
                return BadRequest();
            }
            catch (OperationCanceledException)
            {
                log.LogInformation("Request cancelled. QueryID:{QueryID} DatasetId:{DatasetId}", queryid, datasetid);
                return NoContent();
            }
            catch (LeafRPCException lde)
            {
                return StatusCode(lde.StatusCode);
            }
            catch (LeafCompilerException)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
            catch (Exception ex)
            {
                log.LogError("Could not fetch dataset. QueryID:{QueryID} DatasetID:{DatasetID} Error:{Error}", queryid, datasetid, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}