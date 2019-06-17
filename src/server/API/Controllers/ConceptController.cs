// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTO.Compiler;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Model.Authorization;
using Model.Compiler;
using Model.Search;
using Model.Error;

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
            [FromServices] ConceptHintSearcher searchEngine)
        {
            try
            {
                var hints = await searchEngine.GetHintsAsync(rootParentId, term);
                return Ok(hints);
            }
            catch (ArgumentNullException ane)
            {
                log.LogError("Missing argument. Error:{Error}", ane.Message);
                return BadRequest();
            }
            catch (Exception ex)
            {
                log.LogError("Failed to search concept hints. Term:{Term} Error:{Error}", term, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("search/equivalent")]
        public async Task<ActionResult<ConceptEquivalentHint>> SearchEquivalent(
            string term,
            [FromServices] ConceptHintSearcher searchEngine)
        {
            try
            {
                var hints = await searchEngine.GetSynonymAsync(term);
                return Ok(hints);
            }
            catch (ArgumentNullException ane)
            {
                log.LogError("Missing argument. Error:{Error}", ane.Message);
                return BadRequest();
            }
            catch (Exception ex)
            {
                log.LogError("Failed to search concept equivalent hint. Term:{Term} Error:{Error}", term, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("search/parents")]
        public async Task<ActionResult<IEnumerable<ConceptDTO>>> SearchParents(
            [FromQuery] string searchTerm,
            [FromQuery] Guid? rootId,
            [FromServices] ConceptTreeSearcher searcher)
        {
            try
            {
                var ancestry = await searcher.GetAncestryBySearchTermAsync(rootId, searchTerm);

                return Ok(ancestry.Select(c => new ConceptDTO(c)));
            }
            catch (ArgumentNullException ane)
            {
                log.LogError("Missing argument. Error:{Error}", ane.Message);
                return BadRequest();
            }
            catch (Exception ex)
            {
                log.LogError("Failed to search for concepts by term. Term:{Term} RootId:{RootId} Error:{Error}", searchTerm, rootId, ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet]
        public async Task<ActionResult<ConceptTreeDTO>> GetTreeTop(
            [FromServices] ConceptTreeSearcher searcher)
        {
            try
            {
                var tree = await searcher.GetTreetopAsync();
                var dto = new ConceptTreeDTO(tree);
                return Ok(dto);
            }
            catch (Exception e)
            {
                log.LogError("Failed to retrieve concept treetop. Error:{Error}", e.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }


        [HttpGet("{ident}")]
        public async Task<ActionResult<ConceptDTO>> Single(
            Guid ident,
            [FromServices] ConceptTreeSearcher searcher)
        {
            try
            {
                var concept = await searcher.GetAsync(ident);
                if (concept == null)
                {
                    return NotFound();
                }

                var dto = new ConceptDTO(concept);
                return Ok(dto);
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to retrieve Concept:{Id}. Error:{Error}", ident, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("{ident}/children")]
        public async Task<ActionResult<IEnumerable<ConceptDTO>>> Children(
            Guid ident,
            [FromServices] ConceptTreeSearcher searcher)
        {
            try
            {
                var children = await searcher.GetChildrenAsync(ident);
                var dtos = children.Select(c => new ConceptDTO(c));
                return Ok(dtos);
            }
            catch (LeafRPCException le)
            {
                return StatusCode(le.StatusCode);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to retrieve children of Concept:{Id}. Error:{Error}", ident, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("parents")]
        public async Task<ActionResult<ConceptParentsDTO>> Parents(
            [FromQuery] HashSet<Guid> idents,
            [FromServices] ConceptTreeSearcher searcher)
        {
            try
            {
                var concepts = await searcher.GetAncestryAsync(idents);
                var dto = new ConceptParentsDTO
                {
                    Concepts = concepts.Select(c => new ConceptDTO(c))
                };

                return Ok(dto);
            }
            catch (ArgumentNullException ane)
            {
                log.LogError("Missing argument. Error:{Error}", ane.Message);
                return BadRequest();
            }
            catch (Exception ex)
            {
                log.LogError("Failed to retrieve parents of Concepts:{Ids}. Error:{Error}", idents, ex.ToString());
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpPost("{uid}/preflight")]
        public async Task<ActionResult> Preflight(
            string uid,
            [FromServices] PreflightResourceChecker preflight)
        {
            try
            {
                var @ref = new ConceptRef(uid);
                var result = await preflight.GetConceptsAsync(@ref);
                var check = new ConceptPreflightCheckDTO(result.PreflightCheck);
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
