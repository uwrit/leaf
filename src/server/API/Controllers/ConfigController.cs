// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using API.DTO.Config;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Network;
using Model.Options;

namespace API.Controllers
{
    [AllowAnonymous]
    [Produces("application/json")]
    [Route("api/config")]
    public class ConfigController : Controller
    {
        readonly AuthenticationOptions authenticationOptions;
        readonly LeafVersionOptions versionOptions;
        readonly CohortOptions cohortOptions;
        readonly ClientOptions clientOptions;

        public ConfigController(
            IOptions<AuthenticationOptions> authenticationOptions,
            IOptions<LeafVersionOptions> versionOptions,
            IOptions<CohortOptions> cohortOptions,
            IOptions<ClientOptions> clientOptions)
        {
            this.authenticationOptions = authenticationOptions.Value;
            this.versionOptions = versionOptions.Value;
            this.cohortOptions = cohortOptions.Value;
            this.clientOptions = clientOptions.Value;
        }

        public ActionResult<ConfigDTO> Get()
        {
            var config = new ConfigDTO
            {
                Authentication = new AuthenticationConfigDTO
                {
                    Mechanism = authenticationOptions.Mechanism,
                    InactivityTimeoutMinutes = authenticationOptions.InactiveTimeoutMinutes,
                    LogoutURI = authenticationOptions.LogoutURI.ToString()
                },
                Cohort = new CohortConfigDTO
                {
                    CacheLimit = cohortOptions.RowLimit,
                    ExportLimit = cohortOptions.ExportLimit
                },
                Client = clientOptions,
                Version = versionOptions.Version.ToString()
            };

            return Ok(config);
        }
    }
}
