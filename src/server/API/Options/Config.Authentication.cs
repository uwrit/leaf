// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace API.Options
{
    public static partial class Config
    {
        public static class Authentication
        {
            public const string Section = @"Authentication";
            public const string Mechanism = @"Authentication:Mechanism";
            public const string SessionTimeout = @"Authentication:SessionTimeoutMinutes";
            public const string InactivityTimeout = @"Authentication:InactivityTimeoutMinutes";
            public const string SAML2 = @"Authentication:SAML2";

            public static class Logout
            {
                public const string Enabled = @"Authentication:Logout:Enabled";
                public const string URI = @"Authentication:Logout:URI";
            }
        }
    }
}
