// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Model.Authentication;
using Model.Authorization;
using Model.Options;

namespace API.Authorization
{
    public class AppDbEntitlementProvider : IFederatedEntitlementProvider
    {
        readonly IDbUserRoleAndGroupProvider entitlementProvider;
        readonly AuthorizationOptions authorizationOptions;

        public AppDbEntitlementProvider(
            IDbUserRoleAndGroupProvider entitlementProvider,
            IOptions<AuthorizationOptions> authorizationOptions
        )
        {
            this.entitlementProvider = entitlementProvider;
            this.authorizationOptions = authorizationOptions.Value;
        }

        public Entitlement GetEntitlement(HttpContext _, IScopedIdentity identity)
        {
            var rolesAndGroups = entitlementProvider.FetchEntitlements(identity);
            var mask = GetMask(rolesAndGroups.Roles);

            return new Entitlement
            {
                Mask = mask,
                Groups = rolesAndGroups.Groups
            };
        }

        RoleMask GetMask(IDbUserRoleAndGroupProvider.UserRoles roles)
        {
            var mask = RoleMask.None;

            if (roles.IsUser || authorizationOptions.AllowAllAuthenticatedUsers)
            {
                mask |= RoleMask.User;
            }

            if (roles.IsAdmin)
            {
                mask |= RoleMask.Admin;
            }

            if (roles.IsSuper)
            {
                mask |= RoleMask.Super;
            }

            if (roles.IsIdentified)
            {
                mask |= RoleMask.Identified;
            }

            if (roles.IsFederated)
            {
                mask |= RoleMask.Federated;
            }

            return mask;
        }
    }
}
