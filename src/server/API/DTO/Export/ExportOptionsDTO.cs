// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Options;

namespace API.DTO.Export
{
    public class ExportOptionsDTO
    {
        public REDCapExportOptionsDTO REDCap { get; set; }

        public ExportOptionsDTO(ExportOptions exportOptions)
        {
            REDCap = new REDCapExportOptionsDTO(exportOptions.REDCap);
        }

        public class REDCapExportOptionsDTO
        {
            public string ApiURI { get; set; }
            public string Scope { get; set; }
            public int BatchSize { get; set; }
            public int RowLimit { get; set; }
            public bool Enabled { get; set; }

            public REDCapExportOptionsDTO(REDCapExportOptions redcapOptions)
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
