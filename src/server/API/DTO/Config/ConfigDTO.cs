// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Options;

namespace API.DTO.Config
{
    public class ConfigDTO
    {
        public AuthenticationConfigDTO Authentication { get; set; }
        public CohortConfigDTO Cohort { get; set; }
        public ClientOptions Client { get;set; }
        public string Version { get; set; }
    }

    public class AuthenticationConfigDTO
    {
        public AuthenticationMechanism Mechanism { get; set; }
        public int InactivityTimeoutMinutes { get; set; }
        public string LogoutURI { get; set; }
    }

    public class CohortConfigDTO
    {
        public int CacheLimit { get; set; }
        public int ExportLimit { get; set; }
    }
}
