// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Options;

namespace DTO.User
{
    public class LoginConfigDTO
    {
        public AuthenticationMechanism Mechanism { get; set; }
        public int InactivityTimeoutMinutes { get; set; }
        public int CacheLimit { get; set; }
        public int ExportLimit { get; set; }
        public string Version { get; set; }
        public string LogoutUri { get; set; }

        public ClientOptions ClientOptions { get; set; }
    }
}
