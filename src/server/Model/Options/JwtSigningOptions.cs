// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;


namespace Model.Options
{
    /// <summary>
    /// Metadata required to sign an RSA+SHA512 Jwt.
    /// </summary>
    public class JwtSigningOptions
    {
        /// <summary>
        /// iss
        /// </summary>
        public string Issuer { get; set; }

        /// <summary>
        /// X509 PFX file bytes.
        /// </summary>
        public byte[] Secret { get; set; }

        /// <summary>
        /// Password to the X509 PFX file.
        /// </summary>
        public string Password { get; set; }
    }
}
