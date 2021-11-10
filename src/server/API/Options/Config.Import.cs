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
        public static class Import
        {
            public static class REDCap
            {
                public const string Section = @"Import:REDCap";
                public const string Enabled = @"Import:REDCap:Enabled";
                public const string ApiURI = @"Import:REDCap:ApiURI";
                public const string BatchSize = @"Import:REDCap:BatchSize";
            }
        }
    }
}
