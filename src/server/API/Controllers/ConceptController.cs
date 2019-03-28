// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Services;
using Model.Authorization;
using Model.Compiler;
using Services.Compiler;
using DTO.Compiler;

namespace API.Controllers
{
    [Authorize(Policy = Access.Institutional)]
    [Authorize(Policy = TokenType.Access)]
    [Produces("application/json")]
    [Route("api/concept")]
    public class ConceptController : Controller
    {
        readonly ILogger<ConceptController> log;
        public ConceptController(ILogger<ConceptController> logger)
        {
            log = logger;
        }

        [HttpGet("search/hints")]
        public async Task<ActionResult<IEnumerable<ConceptHint>>> SearchHints(
            [FromQuery] Guid? rootParentId,
            [FromQuery] string term,
            [FromServices] IConceptHintSearchEngine searchEngine
        )
        {
            log.LogInformation("Searching Concepts By Term:{Term}", term);
            try
            {
                var terms = term.Split(' ');
                var hints = await searchEngine.SearchAsync(rootParentId, terms);
                return Ok(hints);
            }
            catch (Exception ex)
            {
                log.LogError("Could not search concept hints. Term:{Term} Error:{Error}", term, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("search/equivalent")]
        public async Task<ActionResult<ConceptEquivalentHint>> SearchEquivalent(
            string term,
            [FromServices] IConceptHintSearchEngine searchEngine
        )
        {
            log.LogInformation("Searching Equivalent Concept Codes By Term:{Term}", term);
            try
            {
                var hints = await searchEngine.SearchEquivalentAsync(term);
                return Ok(hints);
            }
            catch (Exception ex)
            {
                log.LogError("Could not search concept equivalent hint. Term:{Term} Error:{Error}", term, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("search/parents")]
        public async Task<ActionResult<IEnumerable<ConceptDTO>>> SearchParents(
            [FromQuery] string searchTerm,
            [FromQuery] Guid? rootId,
            [FromServices] IConceptTreeReader conceptReader)
        {
            try
            {
                var terms = searchTerm.Split(' ');
                var concepts = await conceptReader.GetWithParentsBySearchTermAsync(rootId, terms);

                return Ok(concepts.Select(c => new ConceptDTO(c)));
            }
            catch (Exception ex)
            {
                log.LogError("Could not search for concepts by term. Term:{Term} RootId:{RootId} Error:{Error}", searchTerm, rootId, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet]
        public async Task<ActionResult<ConceptTreeDTO>> Get([FromServices] IConceptTreeReader conceptReader)
        {
            try
            {
                var tree = await conceptReader.GetTreetopAsync();
                var dto = new ConceptTreeDTO(tree);
                return Ok(dto);
            }
            catch (Exception e)
            {
                log.LogError("Could not retrieve ConceptTree. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }


        [HttpGet("{ident}")]
        public async Task<ActionResult<ConceptDTO>> Single(Guid ident, [FromServices] IConceptTreeReader conceptReader)
        {
            try
            {
                var concept = await conceptReader.GetAsync(ident);
                if (concept == null)
                {
                    return NotFound();
                }

                var dto = new ConceptDTO(concept);
                return Ok(dto);
            }
            catch (LeafDbException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Could not retrieve Concept:{Id}. Error:{Error}", ident, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("{ident}/children")]
        public async Task<ActionResult<IEnumerable<ConceptDTO>>> Children(Guid ident, [FromServices] IConceptTreeReader conceptReader)
        {
            try
            {
                var children = await conceptReader.GetChildrenAsync(ident);
                var dtos = children.Select(c => new ConceptDTO(c));
                return Ok(dtos);
            }
            catch (LeafDbException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Could not retrieve children of Concept:{Id}. Error:{Error}", ident, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("parents")]
        public async Task<ActionResult<ConceptParentsDTO>> Parents(
            [FromQuery] HashSet<Guid> idents,
            [FromServices] IConceptTreeReader conceptReader)
        {
            try
            {
                var concepts = await conceptReader.GetWithParentsAsync(idents);
                var dto = new ConceptParentsDTO
                {
                    Concepts = concepts.Select(c => new ConceptDTO(c))
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                log.LogError("Could not retrieve parents of Concepts:{Ids}. Error:{Error}", idents, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost("{uid}/preflight")]
        public async Task<ActionResult> Preflight(
            string uid,
            [FromServices] IPreflightConceptReader preflightReader)
        {
            log.LogInformation("Preflight check universal concept. UId:{UId}", uid);
            try
            {
                var @ref = new ConceptRef(uid);
                var preflight = await preflightReader.GetAsync(@ref);
                log.LogInformation("Preflight check universal concept result. UId:{UId} Result:{@Result}", uid, preflight.PreflightCheck);
                var check = new ConceptPreflightCheckDTO(preflight.PreflightCheck);
                return Ok(check);
            }
            catch (FormatException fe)
            {
                log.LogError("Malformed concept reference. Uid:{Uid} Error:{Error}", uid, fe.Message);
                return BadRequest();
            }
            catch (Exception e)
            {
                log.LogError("Preflight check universal concept failed. UId:{UId} Error:{Error}", uid, e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
