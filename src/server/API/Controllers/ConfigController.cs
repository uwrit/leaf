// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using API.DTO.Config;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Model.Notification;
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
        readonly AttestationOptions attestationOptions;
        readonly DeidentificationOptions deidentOptions;
        readonly IServerStateCache serverStateCache;

        public ConfigController(
            IOptions<AuthenticationOptions> authenticationOptions,
            IOptions<LeafVersionOptions> versionOptions,
            IOptions<CohortOptions> cohortOptions,
            IOptions<ClientOptions> clientOptions,
            IOptions<AttestationOptions> attestationOptions,
            IOptions<DeidentificationOptions> deidentOptions,
            IServerStateCache serverStateCache)
        {
            this.authenticationOptions = authenticationOptions.Value;
            this.versionOptions = versionOptions.Value;
            this.cohortOptions = cohortOptions.Value;
            this.clientOptions = clientOptions.Value;
            this.attestationOptions = attestationOptions.Value;
            this.deidentOptions = deidentOptions.Value;
            this.serverStateCache = serverStateCache;
        }

        [HttpGet("serverstate")]
        public ServerStateDTO GetServerState()
        {
            return new ServerStateDTO(serverStateCache.GetServerState());
        }

        public ActionResult<ConfigDTO> Get()
        {
            var config = new ConfigDTO
            {
                Authentication = new AuthenticationConfigDTO
                {
                    Mechanism = authenticationOptions.Mechanism,
                    InactivityTimeoutMinutes = authenticationOptions.InactiveTimeoutMinutes,
                    Logout = new AuthenticationConfigDTO.LogoutConfigDTO(authenticationOptions.Logout)
                },
                Attestation = new AttestationConfigDTO
                {
                    Enabled = attestationOptions.Enabled,
                    Text = attestationOptions.Text,
                    Type = attestationOptions.Type
                },
                Cohort = new CohortConfigDTO
                {
                    CacheLimit = cohortOptions.RowLimit,
                    ExportLimit = cohortOptions.ExportLimit,
                    DeidentificationEnabled = deidentOptions.Patient.Enabled
                },
                Client = new ClientOptionsDTO
                {
                    Map = new ClientOptionsDTO.MapOptionsDTO
                    {
                        Enabled = clientOptions.Map.Enabled,
                        TileURI = clientOptions.Map.TileURI
                    },
                    Visualize = new ClientOptionsDTO.VisualizeOptionsDTO
                    {
                        Enabled = clientOptions.Visualize.Enabled,
                        ShowFederated = clientOptions.Visualize.ShowFederated
                    },
                    Timelines = new ClientOptionsDTO.TimelinesOptionsDTO
                    {
                        Enabled = clientOptions.Timelines.Enabled
                    },
                    PatientList = new ClientOptionsDTO.PatientListOptionsDTO
                    {
                        Enabled = clientOptions.PatientList.Enabled
                    },
                    Help = new ClientOptionsDTO.HelpOptionsDTO
                    {
                        Enabled = clientOptions.Help.Enabled,
                        AutoSend = clientOptions.Help.AutoSend,
                        Email = clientOptions.Help.Email,
                        URI = clientOptions.Help.URI
                    }
                },
                Version = new VersionConfigDTO
                {
                    Server = versionOptions.Version.ToString(),
                    Db = serverStateCache.GetServerState().Db.Version.ToString()
                }
            };

            return Ok(config);
        }
    }
}
