// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Options
{
    public static partial class Config
    {
        public static class Export
        {
            public static class REDCap
            {
                public const string Section = @"Export:REDCap";
                public const string ApiURI = @"Export:REDCap:ApiURI";
                public const string BatchSize = @"Export:REDCap:BatchSize";
                public const string RowLimit = @"Export:REDCap:RowLimit";
                public const string Scope = @"Export:REDCap:Scope";
                public const string SuperToken = @"Export:REDCap:SuperToken";
            }
        }
    }
}
