// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Authentication;
using Model.Authorization;
using Microsoft.AspNetCore.Http;
using System.DirectoryServices.AccountManagement;
using Model.Options;
using Microsoft.Extensions.Options;
using Services.Authorization;

namespace API.Authorization
{
    public class ActiveDirectoryEntitlementProvider : IFederatedEntitlementProvider
    {
        readonly IScopedIdentity scopedIdentity;
        readonly RolesMappingOptions roles;
        readonly IMembershipProvider mProvider;

        public ActiveDirectoryEntitlementProvider(
            IScopedIdentity scopedIdentity,
            IOptions<ActiveDirectoryAuthorizationOptions> authOpts,
            IMembershipProvider membershipProvider
        )
        {
            this.scopedIdentity = scopedIdentity;
            roles = authOpts.Value.RolesMapping;
            mProvider = membershipProvider;
        }

        public Entitlement GetEntitlement(HttpContext _)
        {
            var groups = mProvider.GetMembership(scopedIdentity.Identity);

            var mask = GetMask(groups);

            return new Entitlement
            {
                Mask = mask,
                Groups = groups
            };
        }

        RoleMask GetMask(IEnumerable<string> groups)
        {
            var mask = RoleMask.None;

            if (groups.Any(g => g.Equals(roles.User, StringComparison.InvariantCultureIgnoreCase)))
            {
                mask |= RoleMask.User;
            }

            if (groups.Any(g => g.Equals(roles.Admin, StringComparison.InvariantCultureIgnoreCase)))
            {
                mask |= RoleMask.Admin;
            }

            if (groups.Any(g => g.Equals(roles.Super, StringComparison.InvariantCultureIgnoreCase)))
            {
                mask |= RoleMask.Super;
            }

            if (groups.Any(g => g.Equals(roles.Identified, StringComparison.InvariantCultureIgnoreCase)))
            {
                mask |= RoleMask.CanIdentify;
            }

            return mask;
        }
    }
}
