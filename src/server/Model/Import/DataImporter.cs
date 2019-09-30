// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Model.Import
{
    public class DataImporter
    {
        public interface IImportService
        {
            Task<IEnumerable<ImportMetadata>> GetAllImportMetadata();
            Task<ImportMetadata> GetImportMetadataAsync(string sourceId);
            Task<ImportMetadata> GetImportMetadataAsync(Guid id);
            Task<ImportMetadata> CreateImportMetadataAsync(IImportMetadata metadata, IImportStructure structure);
            Task<ImportMetadata> UpdateImportMetadataAsync(IImportMetadata metadata, IImportStructure structure);
            Task<ImportMetadata> DeleteImportMetadataAsync(Guid id);
            Task<IResult> ImportDataAsync(Guid id, IEnumerable<ImportRecord> records);
            Task<IEnumerable<ImportRecord>> GetImportDataAsync(Guid id);
        }

        public interface IResult
        {
            public int Changed { get; set; }
        }

        public interface IImportIdentifierMappingService
        {
            Task<IEnumerable<ImportRecord>> Map(IEnumerable<IImportRecord> records);
        }

        readonly IImportService importService;
        readonly IImportIdentifierMappingService mapper;
        readonly ILogger<DataImporter> log;

        public DataImporter(IImportService importService, IImportIdentifierMappingService mapper, ILogger<DataImporter> log)
        {
            this.importService = importService;
            this.mapper = mapper;
            this.log = log;
        }

        public async Task<ImportMetadata> ImportMetadata(ImportMetadataDTO dto)
        {
            var 
        }
    }
}
