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
using Tests.Util;
using Microsoft.Extensions.Options;

namespace Tests
{
    public class SAML2IdentityProviderTests
    {
        static IOptions<SAML2AuthenticationOptions> GetAuthenticationOptions(string idHeader)
        {
            return Options.Create(new SAML2AuthenticationOptions
            {
                Headers = new SAML2AuthenticationHeaderMappingOptions
                {
                    ScopedIdentity = idHeader
                }
            });
        }

        [Fact]
        public void GetIdentity_Should_Return_Identity_Ok()
        {
            var ctx = HttpHelper.GetHttpContext(("eppn", "johndoe@entity.tld"));
            var opts = GetAuthenticationOptions("eppn");
            var idProvider = new SAML2IdentityProvider(opts);

            var identity = idProvider.GetIdentity(ctx);

            Assert.Equal("johndoe", identity.Identity);
            Assert.Equal("entity.tld", identity.Scope);
        }

        [Fact]
        public void GetIdentity_Should_Throw_On_Header_Not_Found()
        {
            var ctx = HttpHelper.GetHttpContext(("targeted_id", "987a6s8d7f6s65df8a76sd5f7s6d5f"));
            var opts = GetAuthenticationOptions("eppn");
            var idProvider = new SAML2IdentityProvider(opts);

            Assert.Throws<LeafAuthenticationException>(() => idProvider.GetIdentity(ctx));
        }

        [Fact]
        public void GetIdentity_Should_Throw_On_Missing_Value()
        {
            var ctx = HttpHelper.GetHttpContext(("eppn", ""));
            var opts = GetAuthenticationOptions("eppn");
            var idProvider = new SAML2IdentityProvider(opts);

            Assert.Throws<LeafAuthenticationException>(() => idProvider.GetIdentity(ctx));
        }

        [Fact]
        public void GetIdentity_Should_Throw_On_Malformed_Value()
        {
            var ctx = HttpHelper.GetHttpContext(("targeted_id", "987a6s8d7f6s65df8a76sd5f7s6d5f"));
            var opts = GetAuthenticationOptions("targeted_id");
            var idProvider = new SAML2IdentityProvider(opts);

            Assert.Throws<FormatException>(() => idProvider.GetIdentity(ctx));
        }
    }
}
