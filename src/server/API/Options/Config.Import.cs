// Copyright (c) 2019, UW Medicine Research IT, University of Washington
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

                public static class Mapping
                {
                    public const string Select = @"Import:REDCap:Mapping:SELECT";
                    public const string From = @"Import:REDCap:Mapping:FROM";
                    public const string Where = @"Import:REDCap:Mapping:WHERE";
                    public const string FieldSourcePersonId = @"Import:REDCap:Mapping:FieldSourcePersonId";
                }
            }

        }
    }
}
