// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Collections.Generic;
using Model.Network;
using Model.Options;
using Services.Network;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.Options;

namespace API.Jwt
{
    public class JwtKeyResolver : IJwtKeyResolver
    {
        readonly JwtVerifyingOptions jwtOpts;
        readonly NetworkEndpointCache cache;
        readonly NetworkEndpointConcurrentQueueSet refresh;
        readonly ILogger<JwtKeyResolver> log;

        public JwtKeyResolver(
            IOptions<JwtVerifyingOptions> options,
            NetworkEndpointCache cache,
            NetworkEndpointConcurrentQueueSet refresh,
            ILogger<JwtKeyResolver> logger)
        {
            jwtOpts = options.Value;
            this.cache = cache;
            this.refresh = refresh;
            log = logger;
        }

        public IEnumerable<SecurityKey> ResolveKey(
            string token,
            SecurityToken securityToken,
            string kid,
            TokenValidationParameters validationParameters)
        {
            if (!TokenIsValid(token, kid, securityToken))
            {
                return null;
            }

            if (kid == jwtOpts.KeyId && securityToken.Issuer == jwtOpts.Issuer)
            {
                return new SecurityKey[] { new X509SecurityKey(new X509Certificate2(jwtOpts.Certificate)) };
            }

            var ne = cache.Get(securityToken.Issuer);
            if (ne.KeyId == kid)
            {
                return new SecurityKey[] { new X509SecurityKey(new X509Certificate2(ne.Certificate)) };
            }

            refresh.TryEnqueue(ne);
            return null;
        }

        bool TokenIsValid(string token, string kid, SecurityToken secToken)
        {
            var iss = secToken?.Issuer ?? "";
            var ok = kid != null && !string.IsNullOrEmpty(iss);
            if (!ok)
            {
                log.LogInformation($"Received malformed JWT", token);
            }

            return ok;
        }
    }
}
