// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using API.DTO.Cohort;
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
using Newtonsoft.Json;

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
        readonly IShrineUserQueryCache userQueryCache;
        readonly IShrineQueryResultCache queryResultCache;
        readonly IShrineMessageBroker broker;

        public IntegrationController(
            ILogger<IntegrationController> log,
            IOptions<IntegrationOptions> opts,
            IShrineUserQueryCache userQueryCache,
            IShrineQueryResultCache queryResultCache,
            IShrineMessageBroker broker,
            ShrineQueryDefinitionConverter converter
            )
        {
            this.log = log;
            this.opts = opts.Value;
            this.userQueryCache = userQueryCache;
            this.queryResultCache = queryResultCache;
            this.broker = broker;
            this.converter = converter;
        }

        [HttpPost("shrine/count")]
        public ActionResult<long> ShrineCount(
            [FromBody] PatientCountQueryDTO patientCountQuery
            //[FromServices] IUserContextProvider userContextProvider
            )
        {
            if (!opts.Enabled || !opts.SHRINE.Enabled) return BadRequest();

            try
            {
                
                var queryId = ShrineQueryDefinitionConverter.GenerateRandomLongId();
                /*
                var user = userContextProvider.GetUserContext();
                var queryDefinition = converter.ToShrineQuery(patientCountQuery);
                var runQuery = new ShrineRunQueryForResult
                {
                    Query = queryDefinition,
                    Node = new ShrineNode { },
                    Topic = new ShrineTopic { },
                    ResultProgress = new ShrineResultProgress { },
                    Researcher = new ShrineResearcher { },
                    ProtocolVersion = 2
                };
                var contents = new ShrineDeliveryContents
                {
                    Contents = JsonConvert.SerializeObject(runQuery),
                    ContentsSubject = queryId
                };

                userQueryCache.Put(queryId, user, patientCountQuery);
                broker.SendMessageToHub(contents);
                */

                return Ok(queryId);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to initialize SHRINE query. Error:{Error}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("shrine/cohort/{queryId}/count")]
        public ActionResult<ShrineQueryResult> GetShrineCountResult(
            long queryId
            //[FromServices] IUserContextProvider userContextProvider
            )
        {
            if (!opts.Enabled || !opts.SHRINE.Enabled) return BadRequest();

            try
            {

                //var user = userContextProvider.GetUserContext();
                var results = queryResultCache.GetOrDefault(queryId);

                if (results == null) return NotFound();
                //if (results.User.UserName != user.UUID) return NotFound();

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

