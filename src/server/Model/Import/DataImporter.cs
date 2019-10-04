// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Model.Import
{
    public class DataImporter
    {
        public interface IImportService
        {
            Task<IEnumerable<ImportMetadata>> GetAllImportMetadataAsync();
            Task<ImportMetadata> GetImportMetadataAsync(string sourceId);
            Task<ImportMetadata> GetImportMetadataAsync(Guid id);
            Task<ImportMetadata> CreateImportMetadataAsync(ImportMetadata metadata);
            Task<ImportMetadata> UpdateImportMetadataAsync(ImportMetadata metadata);
            Task<ImportMetadata> DeleteImportMetadataAsync(Guid id);
            Task<IImportDataResult> ImportDataAsync(Guid id, IEnumerable<ImportRecord> records);
            Task<IEnumerable<ImportRecord>> GetImportDataAsync(Guid id);
        }

        public interface IImportDataResult
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

        public async Task<IEnumerable<ImportMetadata>> GetAllImportMetadata()
        {
            log.LogInformation("Getting all import metadata.");
            var imports = await importService.GetAllImportMetadataAsync();

            return imports;
        }

        public async Task<ImportMetadata> GetImportMetadata(string sourceId)
        {
            log.LogInformation("Getting import metadata by SourceId. SourceId:{sourceId}", sourceId);
            var import = await importService.GetImportMetadataAsync(sourceId);

            return import;
        }

        public async Task<ImportMetadata> GetImportMetadata(Guid id)
        {
            log.LogInformation("Getting import metadata by Id. ImportMetadataId:{id}", id);
            var import = await importService.GetImportMetadataAsync(id);

            return import;
        }

        public async Task<ImportMetadata> CreateImportMetadata(ImportMetadataDTO dto)
        {
            var import = dto.ToImportMetadata();
            log.LogInformation("Creating import metadata. ImportMetadata:{Metadata}", import);

            var added = await importService.CreateImportMetadataAsync(import);
            log.LogInformation("Completed import metadata creation. ImportMetadata:{Metadata}", import);

            return added;
        }

        public async Task<ImportMetadata> UpdateImportMetadata(ImportMetadataDTO dto)
        {
            var import = dto.ToImportMetadata();
            log.LogInformation("Updating import metadata. ImportMetadata:{Metadata}", import);

            var updated = await importService.UpdateImportMetadataAsync(import);
            log.LogInformation("Completed import metadata update. ImportMetadata:{Metadata}", import);

            return updated;
        }

        public async Task<ImportMetadata> DeleteImportMetadata(Guid id)
        {
            log.LogInformation("Deleting import metadata. ImportMetadataId:{id}", id);
            var deleted = await importService.DeleteImportMetadataAsync(id);

            return deleted;
        }

        public async Task<IImportDataResult> ImportData(Guid id, IEnumerable<ImportRecord> records)
        {
            log.LogInformation("Importing records. ImportMetadataId:{id} RecordCount:{cnt}", id, records.Count());
            var importCount = await importService.ImportDataAsync(id, records);

            return importCount;
        }

        public async Task<IEnumerable<ImportRecord>> GetImportRecords(Guid id)
        {
            log.LogInformation("Getting imported records. ImportMetadataId:{id}", id);
            var data = await importService.GetImportDataAsync(id);

            return data;
        }
    }
}
