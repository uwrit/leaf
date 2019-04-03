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
using API.Authentication;

namespace API.Authorization
{
    public class ActiveDirectoryEntitlementProvider : IFederatedEntitlementProvider
    {
        readonly RolesMappingOptions roles;
        readonly IMembershipProvider mProvider;

        public ActiveDirectoryEntitlementProvider(
            IOptions<ActiveDirectoryAuthorizationOptions> authOpts,
            IMembershipProvider membershipProvider
        )
        {
            roles = authOpts.Value.RolesMapping;
            mProvider = membershipProvider;
        }

        public Entitlement GetEntitlement(HttpContext _, IScopedIdentity identity)
        {
            var groups = mProvider.GetMembership(identity.Identity);

            var mask = GetMask(groups);

            return new Entitlement
            {
                Mask = mask,
                Groups = groups.Where(e => !roles.Roles.Contains(e))
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
