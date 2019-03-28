// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

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
