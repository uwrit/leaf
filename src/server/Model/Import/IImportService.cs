// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Model.Import
{
    public interface IImportService
    {
        Task<IEnumerable<ImportMetadata>> GetAllImportMetadata();
        Task<ImportMetadata> GetImportMetadataAsync(string sourceId);
        Task<ImportMetadata> GetImportMetadataAsync(Guid id);
        Task<ImportMetadata> CreateImportMetadataAsync(IImportMetadata metadata, IImportStructure structure);
        Task<ImportMetadata> UpdateImportMetadataAsync(IImportMetadata metadata, IImportStructure structure);
        Task<ImportMetadata> DeleteImportMetadataAsync(Guid id);
        Task<IResult> ImportDataAsync(IEnumerable<Import> records);
        Task<IEnumerable<IImport>> GetImportDataAsync(Guid id);

        public interface IResult
        {
            public int Changed { get; set; }
        }
    }
}
