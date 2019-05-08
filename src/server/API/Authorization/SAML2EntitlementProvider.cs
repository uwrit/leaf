// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Model.Authorization;
using Model.Authentication;
using Model.Options;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Collections.Generic;

namespace API.Authorization
{
    public class SAML2EntitlementProvider : IFederatedEntitlementProvider
    {
        readonly SAML2AuthorizationOptions options;

        public SAML2EntitlementProvider(IOptions<SAML2AuthorizationOptions> saml)
        {
            options = saml.Value;
        }

        public Entitlement GetEntitlement(HttpContext context, IScopedIdentity _)
        {
            var headerMapping = options.HeadersMapping.Entitlements;
            var headers = context.Request.Headers;

            if (!headers.TryGetValue(headerMapping.Name, out var value))
            {
                throw new LeafAuthenticationException($"{headerMapping.Name} header not found, no entitlements available");
            }

            var asserts = value.ToString()
                            .Split(headerMapping.Delimiter)
                            .Select(s => s.Trim());

            var roleMapping = options.RolesMapping;
            var mask = GetMask(asserts);

            return new Entitlement
            {
                Mask = mask,
                Groups = asserts.Where(e => !roleMapping.Roles.Contains(e))
            };
        }

        RoleMask GetMask(IEnumerable<string> asserts)
        {
            var roles = options.RolesMapping;
            var mask = RoleMask.None;

            if (!string.IsNullOrWhiteSpace(roles.User) && asserts.Contains(roles.User))
            {
                mask |= RoleMask.User;
            }

            if (!string.IsNullOrWhiteSpace(roles.Admin) && asserts.Contains(roles.Admin))
            {
                mask |= RoleMask.Admin;
            }

            if (!string.IsNullOrWhiteSpace(roles.Super) && asserts.Contains(roles.Super))
            {
                mask |= RoleMask.Super;
            }

            if (!string.IsNullOrWhiteSpace(roles.Identified) && asserts.Contains(roles.Identified))
            {
                mask |= RoleMask.Identified;
            }

            return mask;
        }
    }
}
