// Copyright (c) 2022, UW Medicine Research IT, University of Washington
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
    public class SAML2EntitlementProvider : IFederatedEntitlementProvider
    {
        readonly SAML2AuthorizationOptions options;
        readonly AuthorizationOptions authorizationOptions;

        public SAML2EntitlementProvider(
            IOptions<SAML2AuthorizationOptions> saml,
            IOptions<AuthorizationOptions> authorizationOptions
        )
        {
            options = saml.Value;
            this.authorizationOptions = authorizationOptions.Value;
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

            if ((!string.IsNullOrWhiteSpace(roles.User) && asserts.Contains(roles.User)) || authorizationOptions.AllowAllAuthenticatedUsers)
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

            if (!string.IsNullOrWhiteSpace(roles.Federated) && asserts.Contains(roles.Federated))
            {
                mask |= RoleMask.Federated;
            }

            return mask;
        }
    }
}
