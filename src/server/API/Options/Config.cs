// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using Model.Options;

namespace API.Options
{
    public static partial class Config
    {
        public static readonly Version Version = new Version(3, 0);

        public static void ThrowIfInvalid(SAML2AuthorizationOptions opts)
        {
            if (opts == null)
            {
                throw new ArgumentNullException(nameof(opts));
            }

            if (opts.HeadersMapping == null)
            {
                throw new LeafConfigurationException($"{Authorization.Saml2}:{nameof(opts.HeadersMapping)} is required");
            }

            if (opts.RolesMapping == null)
            {
                throw new LeafConfigurationException($"{Authorization.Saml2}:{nameof(opts.RolesMapping)} is required");
            }
        }

        public static void ThrowIfInvalid(ActiveDirectoryAuthorizationOptions opts)
        {
            if (opts == null)
            {
                throw new ArgumentNullException(nameof(opts));
            }

            if (opts.DomainConnection == null)
            {
                throw new LeafConfigurationException($"{Authorization.ActiveDirectory}:{nameof(opts.DomainConnection)} is required");
            }

            if (opts.RolesMapping == null)
            {
                throw new LeafConfigurationException($"{Authorization.ActiveDirectory}:{nameof(opts.RolesMapping)} is required");
            }
        }

        public static class Logging
        {
            public const string Directory = "SERILOG_DIR";
            public const string FileTemplate = "leaf-api-{Date}.log";
        }
    }
}
