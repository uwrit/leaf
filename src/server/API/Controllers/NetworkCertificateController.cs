// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Model.Options;
using Model.Authentication;
using Model.Authorization;
using Model.Network;
using Services;
using Services.Authorization;
using Services.Network;

namespace API.Controllers
{
    /// <summary>
    /// Exposes the current public certificate, keyid, and issuer.
    /// </summary>
    [AllowAnonymous]
    [Produces("application/json")]
    [Route("api/network/certificate")]
    public class NetworkCertificateController : Controller
    {
        readonly JwtVerifyingOptions options;
        readonly IServerContext server;

        public NetworkCertificateController(
            IOptions<JwtVerifyingOptions> opts,
            IServerContext serverContext)
        {
            options = opts.Value;
            server = serverContext;
        }

        [HttpGet]
        public ActionResult<Certificate> Get()
        {
            var cert = new Certificate
            {
                Issuer = options.Issuer,
                KeyId = options.KeyId,
                Data = Convert.ToBase64String(options.Certificate)
            };

            return Ok(cert);
        }
    }
}