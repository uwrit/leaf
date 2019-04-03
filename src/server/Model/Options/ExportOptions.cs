// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Options
{
    public class ExportOptions
    {
        public REDCapOptions REDCap = new REDCapOptions();

        public class REDCapOptions
        {
            public string ApiURI { get; set; }
            public string Scope { get; set; }
            public string SuperToken { get; set; }
            public int BatchSize { get; set; }
            public int RowLimit { get; set; }

            public bool Enabled
            {
                get
                {
                    if (!string.IsNullOrWhiteSpace(Scope) && !string.IsNullOrWhiteSpace(SuperToken) && !string.IsNullOrWhiteSpace(ApiURI))
                    {
                        return true;
                    }
                    return false;
                }
            }
        }
    }
}
