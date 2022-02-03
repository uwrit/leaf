// Copyright (c) 2022, UW Medicine Research IT, University of Washington
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
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Cohort;
using Model.Compiler;
using Model.Error;
using API.Controllers.Base;
using Model.Options;
using Newtonsoft.Json;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Route("api/cohort")]
    public class CohortController : MaybeController<RuntimeOptions>
    {
        readonly ILogger<CohortController> log;

        public CohortController(IOptions<RuntimeOptions> opts, ILogger<CohortController> logger) : base(opts)
        {
            log = logger;
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
            catch (LeafCompilerException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to fetch demographics. QueryID:{QueryID} Error:{Error}", queryid, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("{queryid}/conceptdataset")]
        public async Task<ActionResult<DatasetDTO>> ConceptPanelDataset(
            string queryid,
            [FromQuery] long? early,
            [FromQuery] long? late,
            [FromQuery] string panelItem,
            [FromServices] ConceptDatasetProvider provider,
            CancellationToken cancelToken)
        {
            try
            {
                var queryRef = new QueryRef(queryid);
                var pi = JsonConvert.DeserializeObject<PanelItemDTO>(panelItem);
                var result = await provider.GetConceptDatasetAsync(queryRef, pi, early, late, cancelToken);

                return Ok(new DatasetDTO(result.Dataset));
            }
            catch (FormatException fe)
            {
                log.LogWarning("Malformed concept identifier. Error:{Error}", fe.Message);
                return BadRequest();
            }
            catch (OperationCanceledException)
            {
                log.LogInformation("Request cancelled. QueryID:{QueryID} PanelItem:{PanelItem}", queryid, panelItem);
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
                log.LogError("Failed to fetch concept dataset. QueryID:{QueryID} PanelItem:{PanelItem} Error:{Error}", queryid, panelItem, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("{queryid}/paneldataset")]
        public async Task<ActionResult<DatasetDTO>> PanelDataset(
            string queryid,
            [FromQuery] int panelIdx,
            [FromServices] PanelDatasetProvider provider,
            CancellationToken cancelToken)
        {
            try
            {
                var queryRef = new QueryRef(queryid);
                var result = await provider.GetPanelDatasetAsync(queryRef, panelIdx, cancelToken);

                return Ok(new DatasetDTO(result.Dataset));
            }
            catch (FormatException fe)
            {
                log.LogWarning("Malformed panel dataset identifiers. Error:{Error}", fe.Message);
                return BadRequest();
            }
            catch (OperationCanceledException)
            {
                log.LogInformation("Request cancelled. QueryID:{QueryID} PanelIndex:{PanelIndex}", queryid, panelIdx);
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
                log.LogError("Failed to fetch panel dataset. QueryID:{QueryID} PanelIndex:{PanelIdx} Error:{Error}", queryid, panelIdx, ex.ToString());
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
            [FromQuery] int? panelIdx,
            [FromServices] DatasetProvider provider,
            CancellationToken cancelToken)
        {
            try
            {
                var queryref = new QueryRef(queryid);
                var datasetref = new DatasetQueryRef(datasetid, shape);

                var result = await provider.GetDatasetAsync(queryref, datasetref, cancelToken, early, late, panelIdx);

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
                log.LogError("Failed to fetch dataset. QueryID:{QueryID} DatasetID:{DatasetID} Error:{Error}", queryid, datasetid, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}