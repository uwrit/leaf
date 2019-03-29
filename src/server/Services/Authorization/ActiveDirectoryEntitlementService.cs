// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Authentication;
using Services.Authentication;
using Model.Authorization;
using Microsoft.AspNetCore.Http;
using System.DirectoryServices.AccountManagement;
using Model.Options;
using Microsoft.Extensions.Options;

namespace Services.Authorization
{
    public class ActiveDirectoryEntitlementService : IFederatedEntitlementService
    {
        readonly UserPrincipalContext userContext;
        readonly RolesMappingOptions roles;
        readonly ActiveDirectoryService adService;

        public ActiveDirectoryEntitlementService(
            UserPrincipalContext userPrincipalContext,
            IOptions<ActiveDirectoryAuthorizationOptions> authOpts,
            ActiveDirectoryService activeDirectoryService
        )
        {
            userContext = userPrincipalContext;
            roles = authOpts.Value.RolesMapping;
            adService = activeDirectoryService;
        }

        public Entitlement GetEntitlement(HttpContext _)
        {
            var groups = GetGroups();

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

        IEnumerable<string> GetGroups()
        {
            if (userContext.HasPrincipal)
            {
                return adService.GetMembership(userContext.User);
            }
            return adService.GetMembership(userContext.ScopedIdentity.Identity);
        }
    }
}
