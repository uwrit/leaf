// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Xunit;
using API.Authentication;
using Model.Authentication;
using Model.Options;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Tests
{
    public class SAML2EntitlementProviderTests
    {
        static HttpContext GetHttpContext(params (string, string)[] headers)
        {
            var httpContext = new DefaultHttpContext();
            foreach (var pair in headers)
            {
                httpContext.Request.Headers[pair.Item1] = pair.Item2;
            }
            return httpContext;
        }

        //static IOptions<SAML2AuthorizationOptions> GetAuthOptions()
        //{

        //}

        [Fact]
        public void GetEntitlement_Should_Return_Entitlement_Ok()
        {

        }
    }
}
