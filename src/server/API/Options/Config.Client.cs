// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace API.Options
{
    public partial class Config
    {
        public static class Client
        {
            public static class Map
            {
                public const string Section = @"Client:Map";
                public const string Enabled = @"Client:Map:Enabled";
                public const string TileURI = @"Client:Map:TileURI";
            }
            public static class Visualize
            {
                public const string Section = @"Client:Visualize";
                public const string Enabled = @"Client:Visualize:Enabled";
                public const string ShowFederated = @"Client:Visualize:ShowFederated";
            }
            public static class PatientList
            {
                public const string Section = @"Client:PatientList";
                public const string Enabled = @"Client:PatientList:Enabled";
            }
            public static class Help
            {
                public const string Section = @"Client:Help";
                public const string Enabled = @"Client:Help:Enabled";
                public const string Email = @"Client:Help:Email";
                public const string URI = @"Client:Help:URI";
            }
        }
    }
}
