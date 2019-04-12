// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;
using Model.Options;

namespace API.DTO.Export
{
    public class ExportOptionsDTO
    {
        public REDCapOptions REDCap { get; set; }

        public ExportOptionsDTO(ExportOptions exportOptions)
        {
            REDCap = new REDCapOptions(exportOptions.REDCap);
        }

        public class REDCapOptions
        {
            public string ApiURI { get; set; }
            public string Scope { get; set; }
            public int BatchSize { get; set; }
            public int RowLimit { get; set; }
            public bool Enabled { get; set; }

            public REDCapOptions(ExportOptions.REDCapOptions redcapOptions)
            {
                ApiURI = redcapOptions.ApiURI;
                Scope = redcapOptions.Scope;
                BatchSize = redcapOptions.BatchSize;
                RowLimit = redcapOptions.RowLimit;
                Enabled = redcapOptions.Enabled;
            }
        }
    }
}
