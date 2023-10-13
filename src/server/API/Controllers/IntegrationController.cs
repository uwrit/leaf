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

namespace API.Controllers
{
    [Authorize(Policy = TokenType.Access)]
    [Authorize(Policy = Access.Institutional)]
    [Route("api/integration")]
    public class IntegrationController : Controller
    {
        readonly ILogger<IntegrationController> log;
        readonly IntegrationOptions opts;
        readonly IShrineUserQueryCache userQueryCache;
        readonly IShrineQueryResultCache queryResultCache;
        readonly IShrineMessageBroker messageBroker;

        public IntegrationController(
            ILogger<IntegrationController> log,
            IOptions<IntegrationOptions> opts,
            IShrineUserQueryCache userQueryCache,
            IShrineQueryResultCache queryResultCache,
            IShrineMessageBroker messageBroker
            )
        {
            this.log = log;
            this.opts = opts.Value;
            this.userQueryCache = userQueryCache;
            this.queryResultCache = queryResultCache;
            this.messageBroker = messageBroker;
        }

        [HttpPost("shrine/count")]
        public ActionResult<long> ShrineCount(
            [FromBody] PatientCountQueryDTO patientCountQuery,
            [FromServices] IUserContextProvider userContextProvider)
        {
            if (!opts.Enabled || !opts.SHRINE.Enabled) return BadRequest();

            var queryId = ShrineQueryDefinitionConverter.GenerateRandomLongId();
            var user = userContextProvider.GetUserContext();

            userQueryCache.Put(queryId, user, patientCountQuery);
            //messageBroker.

            try
            {
                //var opts = new ExportOptionsDTO(exportOptions);
                return Ok(null);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to TODO. Error:{Error}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }

        [HttpGet("shrine/cohort/{queryId}/count")]
        public ActionResult<ShrineQueryResult> GetShrineCountResult(
            long queryId,
            [FromServices] IUserContextProvider userContextProvider
            )
        {
            if (!opts.Enabled || !opts.SHRINE.Enabled) return BadRequest();

            try
            {
                var user = userContextProvider.GetUserContext();
                var results = queryResultCache.GetOrDefault(queryId);

                if (results == null) return NotFound();
                if (results.User.UserName != user.UUID) return NotFound();

                return Ok(results);
            }
            catch (Exception ex)
            {
                log.LogError("Failed to TODO. Error:{Error}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError);
            }
        }
    }
}

