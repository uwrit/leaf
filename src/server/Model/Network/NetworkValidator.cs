// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.Extensions.Options;
using Model.Options;

namespace Model.Network
{
    public class NetworkValidator
    {
        readonly NetworkValidationOptions options;

        public NetworkValidator(IOptions<NetworkValidationOptions> opts)
        {
            options = opts.Value;
        }

        /// <summary>
        /// Ensures that the Uri's scheme is correct for the Hosting Environment.
        /// </summary>
        /// <param name="endpoint">Endpoint address holder to validate</param>
        /// <exception cref="UriFormatException"></exception>
        public void Validate(IUriAddress endpoint)
        {
            if (endpoint.Address == null)
            {
                throw new ArgumentNullException(nameof(endpoint.Address));
            }

            if (options.EnsureHttps && endpoint.Address.Scheme != Uri.UriSchemeHttps)
            {
                throw new UriFormatException("All peering nodes must be HTTPS");
            }
        }
    }
}
