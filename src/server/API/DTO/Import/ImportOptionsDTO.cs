// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Options;

namespace API.DTO.Import
{
    public class ImportOptionsDTO
    {
        public REDCapImportOptionsDTO REDCap { get; set; }

        public ImportOptionsDTO(ImportOptions importOptions)
        {
            REDCap = new REDCapImportOptionsDTO(importOptions.REDCap);
        }

        public class REDCapImportOptionsDTO
        {
            public bool Enabled { get; set; }
            public string ApiURI { get; set; }
            public int BatchSize { get; set; }

            public REDCapImportOptionsDTO(REDCapImportOptions redcapOptions)
            {
                ApiURI = redcapOptions.ApiURI;
                BatchSize = redcapOptions.BatchSize;
                Enabled = redcapOptions.Enabled;
            }
        }
    }
}
