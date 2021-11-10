// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Model.Authentication;
using Model.Authorization;
using Model.Options;

namespace API.Authorization
{
    public class ActiveDirectoryEntitlementProvider : IFederatedEntitlementProvider
    {
        readonly RolesMappingOptions roles;
        readonly IMembershipProvider mProvider;
        readonly AuthorizationOptions authorizationOptions;

        public ActiveDirectoryEntitlementProvider(
            IOptions<ActiveDirectoryAuthorizationOptions> authOpts,
            IOptions<AuthorizationOptions> authorizationOptions,
            IMembershipProvider membershipProvider
        )
        {
            roles = authOpts.Value.RolesMapping;
            mProvider = membershipProvider;
            this.authorizationOptions = authorizationOptions.Value;
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

            if (!string.IsNullOrWhiteSpace(roles.User) && groups.Any(g => g.Equals(roles.User, StringComparison.InvariantCultureIgnoreCase)))
            {
                mask |= RoleMask.User;
            }

            if (authorizationOptions.AllowAllAuthenticatedUsers)
            {
                mask |= RoleMask.User;
            }

            if (!string.IsNullOrWhiteSpace(roles.Admin) && groups.Any(g => g.Equals(roles.Admin, StringComparison.InvariantCultureIgnoreCase)))
            {
                mask |= RoleMask.Admin;
            }

            if (!string.IsNullOrWhiteSpace(roles.Super) && groups.Any(g => g.Equals(roles.Super, StringComparison.InvariantCultureIgnoreCase)))
            {
                mask |= RoleMask.Super;
            }

            if (!string.IsNullOrWhiteSpace(roles.Identified) && groups.Any(g => g.Equals(roles.Identified, StringComparison.InvariantCultureIgnoreCase)))
            {
                mask |= RoleMask.Identified;
            }

            if (!string.IsNullOrWhiteSpace(roles.Federated) && groups.Any(g => g.Equals(roles.Federated, StringComparison.InvariantCultureIgnoreCase)))
            {
                mask |= RoleMask.Federated;
            }

            return mask;
        }
    }
}
