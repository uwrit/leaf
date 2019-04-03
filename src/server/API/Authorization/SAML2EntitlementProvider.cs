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

namespace Services.Authorization
{
    public class SAML2EntitlementProvider : IFederatedEntitlementProvider
    {
        readonly SAML2AuthorizationOptions options;

        public SAML2EntitlementProvider(IOptions<SAML2AuthorizationOptions> saml)
        {
            options = saml.Value;
        }

        public Entitlement GetEntitlement(HttpContext context)
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
            var roleMapping = options.RolesMapping;
            var mask = RoleMask.None;

            if (asserts.Contains(roleMapping.User))
            {
                mask |= RoleMask.User;
            }

            if (asserts.Contains(roleMapping.Admin))
            {
                mask |= RoleMask.Admin;
            }

            if (asserts.Contains(roleMapping.Super))
            {
                mask |= RoleMask.Super;
            }

            if (asserts.Contains(roleMapping.Identified))
            {
                mask |= RoleMask.CanIdentify;
            }

            return mask;
        }
    }
}
