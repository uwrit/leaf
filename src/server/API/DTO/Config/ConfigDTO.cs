﻿// Copyright (c) 2020, UW Medicine Research IT, University of Washington
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
        public AttestationConfigDTO Attestation { get; set; }
        public CohortConfigDTO Cohort { get; set; }
        public ClientOptionsDTO Client { get;set; }
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
        public bool DeidentificationEnabled { get; set; }
    }

    public class AttestationConfigDTO
    {
        public bool Enabled { get; set; }
    }

    public class ClientOptionsDTO
    {
        public MapOptionsDTO Map = new MapOptionsDTO();
        public VisualizeOptionsDTO Visualize = new VisualizeOptionsDTO();
        public PatientListOptionsDTO PatientList = new PatientListOptionsDTO();
        public HelpOptionsDTO Help = new HelpOptionsDTO();

        public class MapOptionsDTO
        {
            public bool Enabled { get; set; }
            public string TileURI { get; set; }
        }
        public class VisualizeOptionsDTO
        {
            public bool Enabled { get; set; }
            public bool ShowFederated { get; set; }
        }
        public class PatientListOptionsDTO
        {
            public bool Enabled { get; set; }
        }
        public class HelpOptionsDTO
        {
            public bool Enabled { get; set; }
            public bool AutoSend { get; set; }
            public string Email { get; set; }
            public string URI { get; set; }
        }
    }
}
