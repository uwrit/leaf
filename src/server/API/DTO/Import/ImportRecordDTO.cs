// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using Model.Import;
using System;
using System.Collections.Generic;

namespace API.DTO.Import
{
    public class ImportRecordDTO : IImportRecord
    {
        
        public string Id { get; set; }
        public Guid ImportMetadataId { get; set; }
        public string SourceModifier { get; set; }
        public string SourcePersonId { get; set; }
        public string SourceValue { get; set; }
        public string ValueString { get; set; }
        public decimal? ValueNumber { get; set; }
        public DateTime? ValueDate { get; set; }

        public ImportRecord ToImportRecord()
        {
            return new ImportRecord
            {
                Id = Id,
                ImportMetadataId = ImportMetadataId,
                SourcePersonId = SourcePersonId,
                SourceValue = SourceValue,
                ValueString = ValueString,
                ValueNumber = ValueNumber,
                ValueDate = ValueDate
            };
        }
    }

    public class ImportDataRecordDTO
    {
        public IEnumerable<ImportRecordDTO> Records { get; set; } 
    }
}

