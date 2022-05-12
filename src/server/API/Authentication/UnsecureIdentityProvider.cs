// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.AspNetCore.Http;
using Model.Options;
using Model.Authentication;
using Microsoft.Extensions.Options;

namespace API.Authentication
{
    public class UnsecureIdentityProvider : IFederatedIdentityProvider
    {
        readonly AuthenticationOptions authenticationOpts;
        readonly AuthorizationOptions authorizationOpts;

        public UnsecureIdentityProvider(
            IOptions<AuthenticationOptions> authenticationOpts,
            IOptions<AuthorizationOptions> authorizationOpts
        )
        {
            this.authenticationOpts = authenticationOpts.Value;
            this.authorizationOpts = authorizationOpts.Value;
        }

        public IScopedIdentity GetIdentity(HttpContext context)
        {
            return new UnsecureScopedIdentity
            {
                Identity = authorizationOpts.UnsecuredIsAdmin
                    ? "admin"
                    : "user",
                Scope = "localhost"
            };
        }
    }
}
