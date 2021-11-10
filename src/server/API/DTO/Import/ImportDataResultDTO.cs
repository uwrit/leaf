// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Import;

namespace API.DTO.Import
{
    public class ImportDataResultDTO
    {
        public int Changed { get; set; }
        public IEnumerable<string> Unmapped { get; set; }

        public ImportDataResultDTO(DataImporter.IImportDataResult result)
        {
            Changed = result.Changed;
            Unmapped = result.Unmapped;
        }
    }
}
