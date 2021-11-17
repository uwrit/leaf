// Copyright (c) 2021, UW Medicine Research IT, University of Washington
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
using Tests.Util;
using Microsoft.Extensions.Options;
using System.Linq;

namespace Tests
{
    public class SAML2EntitlementProviderTests
    {
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

        static IScopedIdentity GetUserContext(string id)
        {
            return new SAML2ScopedIdentity(id);
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
            var eProvider = new SAML2EntitlementProvider(opts, Options.Create(new AuthorizationOptions()));
            var ctx = HttpHelper.GetHttpContext(("iam-groups", "leaf_users; leaf_admin; surgery"));
            var identity = GetUserContext("johndoe@entity.tld");

            var entitlement = eProvider.GetEntitlement(ctx, identity);

            Assert.Contains(entitlement.Groups, g => g == "surgery");
            Assert.True(1 == entitlement.Groups.Count());
            Assert.True(entitlement.Mask.HasFlag(RoleMask.User));
            Assert.True(entitlement.Mask.HasFlag(RoleMask.Admin));
            Assert.False(entitlement.Mask.HasFlag(RoleMask.Super));
            Assert.False(entitlement.Mask.HasFlag(RoleMask.Identified));
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
            var eProvider = new SAML2EntitlementProvider(opts, Options.Create(new AuthorizationOptions()));
            var ctx = HttpHelper.GetHttpContext(("iam-groups", "leaf_users"));
            var identity = GetUserContext("johndoe@entity.tld");

            var entitlement = eProvider.GetEntitlement(ctx, identity);

            Assert.True(entitlement.Mask.HasFlag(RoleMask.User));
            Assert.False(entitlement.Mask.HasFlag(RoleMask.Admin));
            Assert.False(entitlement.Mask.HasFlag(RoleMask.Super));
            Assert.False(entitlement.Mask.HasFlag(RoleMask.Identified));
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
            var eProvider = new SAML2EntitlementProvider(opts, Options.Create(new AuthorizationOptions()));
            var ctx = HttpHelper.GetHttpContext(("iam-groups", "leaf_users"));
            var identity = GetUserContext("johndoe@entity.tld");

            Assert.Throws<LeafAuthenticationException>(() => eProvider.GetEntitlement(ctx, identity));
        }
    }
}
