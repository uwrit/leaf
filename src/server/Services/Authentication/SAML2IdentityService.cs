// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.AspNetCore.Http;
using Model.Options;
using Model.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;

namespace Services.Authentication
{
    public class SAML2IdentityService : IFederatedIdentityService
    {
        readonly UserPrincipalContext userContext;
        readonly SAML2AuthenticationOptions options;

        public SAML2IdentityService(IOptions<SAML2AuthenticationOptions> options, UserPrincipalContext userPrincipalContext)
        {
            userContext = userPrincipalContext;
            this.options = options.Value;
        }

        public IScopedIdentity GetIdentity(HttpContext context)
        {
            var mapping = options.Headers.ScopedIdentity;
            var headers = context.Request.Headers;
            if (!headers.TryGetValue(mapping, out var scoped))
            {
                throw new LeafAuthenticationException($"{mapping} header not found, no scoped identity available");
            }

            var id = new SAML2ScopedIdentity(scoped);
            userContext.ScopedIdentity = id;
            return id;
        }
    }
}
