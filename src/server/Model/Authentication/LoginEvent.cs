// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Security.Claims;

namespace Model.Authentication
{
    public class LoginEvent
    {
        public string ScopedIdentity { get; set; }
        public string FullIdentity { get; set; }
        public IEnumerable<Claim> Claims { get; set; }

        public LoginEvent()
        {

        }

        public LoginEvent(IScopedIdentity identity, string issuer, IEnumerable<Claim> claims)
        {
            ScopedIdentity = identity.ScopedIdentity;
            FullIdentity = $"{identity.ScopedIdentity}@{issuer}";
            Claims = claims;
        }
    }
}
