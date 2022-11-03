// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Options
{
    public class ExportOptions
    {
        public CSVExportOptions CSV { get; set; }
        public REDCapExportOptions REDCap { get; set; }
    }

    public class REDCapExportOptions : IEnabled
    {
        public string ApiURI { get; set; }
        public string Scope { get; set; }
        public string SuperToken { get; set; }
        public int BatchSize { get; set; }
        public int RowLimit { get; set; }
        public bool IncludeScopeInUsername { get; set; }
        public bool Enabled { get; set; } = false;
    }

    public class CSVExportOptions : IEnabled
    {
        public bool Enabled { get; set; } = false;
    }
}
