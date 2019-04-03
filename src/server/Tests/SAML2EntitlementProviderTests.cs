// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Xunit;
using API.Authorization;
using Model.Authentication;
using Model.Authorization;
using Model.Options;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Linq;

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

        static IOptions<SAML2AuthorizationOptions> GetAuthOptions(HeaderDigestionOptions digs, RolesMappingOptions roles)
        {
            return Options.Create(new SAML2AuthorizationOptions
            {
                HeadersMapping = new HeadersMappingOptions
                {
                    Entitlements = digs
                },
                RolesMapping = roles
            });
        }

        [Fact]
        public void GetEntitlement_Multi_Should_Return_Entitlement_Ok()
        {
            var headerDigestion = new HeaderDigestionOptions
            {
                Name = "iam-groups",
                Delimiter = ";"
            };
            var roleMapping = new RolesMappingOptions
            {
                User = "leaf_users",
                Super = "leaf_supers",
                Identified = "leaf_phi",
                Admin = "leaf_admin"
            };
            var opts = GetAuthOptions(headerDigestion, roleMapping);
            var eProvider = new SAML2EntitlementProvider(opts);
            var ctx = GetHttpContext(("iam-groups", "leaf_users; leaf_admin; surgery"));

            var entitlement = eProvider.GetEntitlement(ctx);

            Assert.Contains(entitlement.Groups, g => g == "surgery");
            Assert.True(entitlement.Groups.Count() == 1);
            Assert.True(entitlement.Mask.HasFlag(RoleMask.User));
            Assert.True(entitlement.Mask.HasFlag(RoleMask.Admin));
            Assert.False(entitlement.Mask.HasFlag(RoleMask.Super));
            Assert.False(entitlement.Mask.HasFlag(RoleMask.CanIdentify));
        }

        [Fact]
        public void GetEntitlement_Single_Should_Return_Entitlement_Ok()
        {
            var headerDigestion = new HeaderDigestionOptions
            {
                Name = "iam-groups",
                Delimiter = ";"
            };
            var roleMapping = new RolesMappingOptions
            {
                User = "leaf_users",
                Super = "leaf_supers",
                Identified = "leaf_phi",
                Admin = "leaf_admin"
            };
            var opts = GetAuthOptions(headerDigestion, roleMapping);
            var eProvider = new SAML2EntitlementProvider(opts);
            var ctx = GetHttpContext(("iam-groups", "leaf_users"));

            var entitlement = eProvider.GetEntitlement(ctx);

            Assert.True(entitlement.Mask.HasFlag(RoleMask.User));
            Assert.False(entitlement.Mask.HasFlag(RoleMask.Admin));
            Assert.False(entitlement.Mask.HasFlag(RoleMask.Super));
            Assert.False(entitlement.Mask.HasFlag(RoleMask.CanIdentify));
        }

        [Fact]
        public void GetEntitlement_Should_Throw_If_Header_Not_Found()
        {
            var headerDigestion = new HeaderDigestionOptions
            {
                Name = "iam-group",
                Delimiter = ";"
            };
            var roleMapping = new RolesMappingOptions
            {
                User = "leaf_users",
                Super = "leaf_supers",
                Identified = "leaf_phi",
                Admin = "leaf_admin"
            };
            var opts = GetAuthOptions(headerDigestion, roleMapping);
            var eProvider = new SAML2EntitlementProvider(opts);
            var ctx = GetHttpContext(("iam-groups", "leaf_users"));

            Assert.Throws<LeafAuthenticationException>(() => eProvider.GetEntitlement(ctx));
        }
    }
}
