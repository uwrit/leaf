// Copyright (c) 2020, UW Medicine Research IT, University of Washington
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
using System.Collections.Generic;
using Tests.Mock.Services.Authorization;
using API.Authentication;

namespace Tests
{
    public class ActiveDirectoryEntitlementProviderTests
    {
        static IMembershipProvider GetMembershipProvider(IEnumerable<string> mship)
        {
            return new MockMembershipProvider(new List<string>(), mship);
        }

        static IOptions<ActiveDirectoryAuthorizationOptions> GetOptions()
        {
            return Options.Create(new ActiveDirectoryAuthorizationOptions
            {
                RolesMapping = new RolesMappingOptions
                {
                    User = "leaf_users",
                    Super = "leaf_supers",
                    Identified = "leaf_phi",
                    Admin = "leaf_admin"
                }
            });
        }

        static IScopedIdentity GetUserContext(string id) => new SAML2ScopedIdentity(id);

        [Fact]
        public void GetEntitlement_Should_Return_Entitlement_Ok()
        {
            var mock = GetMembershipProvider(new string[] { "leaf_users", "surgery", "leaf_phi" });
            var opts = GetOptions();
            var identity = GetUserContext("johndoe@entity.tld");

            var eProvider = new ActiveDirectoryEntitlementProvider(opts, mock);

            var e = eProvider.GetEntitlement(HttpHelper.GetHttpContext(), identity);

            Assert.Contains(e.Groups, g => g == "surgery");
            Assert.True(1 == e.Groups.Count());
            Assert.True(e.Mask.HasFlag(RoleMask.User));
            Assert.True(e.Mask.HasFlag(RoleMask.Identified));
            Assert.False(e.Mask.HasFlag(RoleMask.Admin));
            Assert.False(e.Mask.HasFlag(RoleMask.Super));
        }
    }
}
