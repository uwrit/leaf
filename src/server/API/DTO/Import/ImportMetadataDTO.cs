// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Import;

namespace API.DTO.Import
{
    public class ImportMetadataDTO : IImportMetadata
    {
        public Guid? Id { get; set; }
        public string SourceId { get; set; }
        public ImportType Type { get; set; }
        public string Structure { get; set; }
    }
}
