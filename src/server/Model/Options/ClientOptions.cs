// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Options
{
    public class ClientOptions
    {
        public MapOptions Map = new MapOptions();
        public VisualizeOptions Visualize = new VisualizeOptions();
        public PatientListOptions PatientList = new PatientListOptions();
        public HelpOptions Help = new HelpOptions();

        public class MapOptions
        {
            public bool Enabled { get; set; }
            public string TileURI { get; set; }
        }
        public class VisualizeOptions
        {
            public bool Enabled { get; set; }
            public bool ShowFederated { get; set; }
        }
        public class PatientListOptions
        {
            public bool Enabled { get; set; }
        }
        public class HelpOptions
        {
            public bool Enabled { get; set; }
            public bool AutoSend { get; set; }
            public string Email { get; set; }
            public string URI { get; set; }
        }
    }
}
