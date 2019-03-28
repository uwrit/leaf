// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.AspNetCore.Http;
using Model.Options;
using Model.Authentication;
using Microsoft.Extensions.Options;

namespace Services.Authentication
{
    public class UnsecureIdentityService : IFederatedIdentityService
    {
        readonly JwtVerifyingOptions jwtVerifyingOptions;

        public UnsecureIdentityService(IOptions<JwtVerifyingOptions> jwtOptions)
        {
            jwtVerifyingOptions = jwtOptions.Value;
        }

        public IScopedIdentity GetIdentity(HttpContext context)
        {
            return new UnsecureScopedIdentity
            {
                Identity = "admin",
                Scope = jwtVerifyingOptions.Issuer
            };
        }
    }
}
