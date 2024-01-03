// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using API.DTO.Cohort;
using API.DTO.Integration.Shrine;
using API.Integration.Shrine;
using API.Integration.Shrine4_1;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Integration.Shrine;
using Model.Options;

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Authorize(Policy = Access.Institutional)]
    [Route("api/integration")]
    public class IntegrationController : Controller
    {
        readonly ILogger<IntegrationController> log;
        readonly IntegrationOptions opts;
        readonly ShrineQueryDefinitionConverter converter;
        readonly IUserContext user;
        readonly IShrineUserQueryCache userQueryCache;
        readonly IShrineQueryResultCache queryResultCache;
        readonly IShrineMessageBroker broker;

        public IntegrationController(
            ILogger<IntegrationController> log,
            IOptions<IntegrationOptions> opts,
            IUserContext user,
            IShrineUserQueryCache userQueryCache,
            IShrineQueryResultCache queryResultCache,
            IShrineMessageBroker broker,
            ShrineQueryDefinitionConverter converter
            )
        {
            this.log = log;
            this.opts = opts.Value;
            this.user = user;
            this.userQueryCache = userQueryCache;
            this.queryResultCache = queryResultCache;
            this.broker = broker;
            this.converter = converter;
        }

        [HttpPost("shrine/count")]
        public ActionResult<long> ShrineCount(
            [FromBody] PatientCountQueryDTO patientCountQuery
            )
        {
            if (!opts.Enabled || !opts.SHRINE.Enabled) return BadRequest();

            try
            {
                var queryId = ShrineQueryDefinitionConverter.GenerateRandomLongId();
                var queryDefinition = converter.ToShrineQuery(patientCountQuery);

                var researcher = opts.SHRINE.Researcher;
                var node = opts.SHRINE.Node;
                var topic = opts.SHRINE.Topic;
                var runQuery = new ShrineRunQueryForResult
                {
                    Query = queryDefinition,
                    Researcher = new ShrineResearcher
                    {
                        Id = researcher.Id,
                        VersionInfo = queryDefinition.VersionInfo,
                        UserName = researcher.Name,
                        UserDomainName = researcher.Domain,
                        NodeId = node.Id
                    },
                    Topic = new ShrineTopic
                    {
                        Id = topic.Id,
                        VersionInfo = queryDefinition.VersionInfo,
                        ResearcherId = researcher.Id,
                        Name = topic.Name,
                        Description = topic.Description
                    },
                    ProtocolVersion = 2
                };
                var dto = new ShrineRunQueryForResultDTO(runQuery);
                userQueryCache.Put(queryId, user, patientCountQuery);
                broker.SendMessageToHub(queryId, dto, ShrineDeliveryContentsType.RunQueryAtHub);

                return Ok(queryId);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to initialize SHRINE query. Error:{Error}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("shrine/cohort/{queryId}/count")]
        public ActionResult<ShrineQueryResult> GetShrineCountResult(long queryId)
        {
            if (!opts.Enabled || !opts.SHRINE.Enabled) return BadRequest();

            try
            {
                var results = queryResultCache.GetOrDefault(queryId);
                if (results == null) return NotFound();

                return Ok(results);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to retrieve SHRINE query results. Error:{Error}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}

