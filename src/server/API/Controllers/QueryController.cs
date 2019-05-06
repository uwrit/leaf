// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using API.DTO.Compiler;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Compiler;
using Model.Extensions;
using Model.Search;
using Model.Tagging;
using Model.Validation;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Produces("application/json")]
    [Route("api/query")]
    public class QueryController : Controller
    {
        readonly ILogger<QueryController> log;
        readonly IQueryService queryService;
        readonly IUserContext user;

        public QueryController(IQueryService queryService, ILogger<QueryController> logger, IUserContext userContext)
        {
            log = logger;
            this.queryService = queryService;
            user = userContext;
        }

        [Authorize(Policy = Access.Institutional)]
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BaseQueryDTO>>> Get()
        {
            try
            {
                var queries = await queryService.GetQueries();
                return Ok(queries.Select(q => new BaseQueryDTO(q)));
            }
            catch (Exception e)
            {
                log.LogInformation("Could not get saved queries. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("{ident}")]
        public async Task<ActionResult<QueryDTO>> Get(string ident)
        {
            try
            {
                var urn = QueryUrn.From(ident);
                var query = await queryService.GetQuery(urn);
                if (query == null)
                {
                    return NotFound();
                }
                return Ok(new QueryDTO(query));
            }
            catch (LeafDbException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception e)
            {
                log.LogError("Could not get query. Identifier:{Identifier} Error:{Error}", ident, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost("{id}")]
        public async Task<ActionResult<QuerySaveResponseDTO>> Save(
            string id,
            [FromBody] QuerySaveDTO querySave,
            [FromServices] PanelConverter panelConverter,
            [FromServices] IPanelValidator panelValidator,
            CancellationToken cancelToken
        )
        {
            try
            {
                // federated user submitting an initial save request
                if (!user.IsInstutional && QueryUrn.From(querySave.UniversalId) == null)
                {
                    return BadRequest("Initial save requests must be made to home node.");
                }

                var ctx = await panelConverter.GetPanelsAsync(querySave, cancelToken);
                if (!ctx.PreflightPassed)
                {
                    return BadRequest(new QuerySaveResponseDTO { Preflight = new PreflightCheckDTO(ctx.PreflightCheck) });
                }
                var query = panelValidator.Validate(ctx);

                cancelToken.ThrowIfCancellationRequested();

                if (!user.IsInstutional)
                {
                    panelConverter.LocalizeDefinition(querySave, query);
                }


                var toSave = new QuerySave
                {
                    QueryId = new Guid(id),
                    UniversalId = ctx.UniversalId,
                    Name = querySave.Name,
                    Category = querySave.Category,
                    Definition = QueryDefinitionDTO.JSON(querySave),
                    Resources = query.Panels.GetResources()
                };
                if (querySave.Ver.HasValue)
                {
                    toSave.Ver = querySave.Ver.Value;
                }

                var saved = await queryService.Save(toSave);

                if (saved == null)
                {
                    return NotFound();
                }

                var response = new QuerySaveResponseDTO
                {
                    Preflight = new PreflightCheckDTO(ctx.PreflightCheck),
                    Query = new QuerySaveResultDTO(saved)
                };

                return Ok(response);
            }
            catch (InvalidOperationException ie)
            {
                log.LogError("Unrecoverable validation error in query. Error:{Error}", ie.Message);
                return BadRequest();
            }
            catch (FormatException fe)
            {
                log.LogError("Malformed query identifier. Id:{Id} UniversalId:{UniversalId} Error:{Error}", id, querySave.UniversalId, fe.Message);
                return BadRequest();
            }
            catch (OperationCanceledException)
            {
                log.LogInformation("Request cancelled.");
                return NoContent();
            }
            catch (LeafDbException lde)
            {
                return StatusCode(lde.StatusCode);
            }
            catch (Exception e)
            {
                log.LogError("Could not save query. QueryId:{QueryId} Query:{@Query} Error:{Error}", id, querySave, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpDelete("{ident}")]
        public async Task<ActionResult<QueryDeleteResultDTO>> Delete(string ident, [FromQuery] bool force)
        {
            try
            {
                var urn = QueryUrn.From(ident);
                var result = await queryService.Delete(urn, force);

                if (!result.Ok)
                {
                    return Conflict(QueryDeleteResultDTO.From(result.Dependents));
                }

                return Ok();
            }
            catch (FormatException fe)
            {
                log.LogError("Malformed query identifer. UniversalId:{UniversalId} Error:{Error}", ident, fe.Message);
                return BadRequest();
            }
            catch (LeafDbException lde)
            {
                return StatusCode(lde.StatusCode);
            }
            catch (Exception e)
            {
                log.LogError("Could not delete query. UniversalId:{UniversalId} Error:{Error}", ident, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [Authorize(Policy = Access.Institutional)]
        [HttpPost("preflight")]
        public async Task<ActionResult<PreflightCheckDTO>> Preflight(
            [FromBody] ResourceRef resourceRef,
            [FromServices] PreflightResourceChecker preflight)
        {
            try
            {
                var refs = new ResourceRefs(new ResourceRef[] { resourceRef });
                var preflightResources = await preflight.GetResourcesAsync(refs);
                return Ok(new PreflightCheckDTO(preflightResources));
            }
            catch (LeafDbException lde)
            {
                return StatusCode(lde.StatusCode);
            }
            catch (Exception e)
            {
                log.LogError("Could not preflight resource. Resource:{@Resource} Error:{Error}", resourceRef, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
