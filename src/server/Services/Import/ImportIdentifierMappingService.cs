// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Data.SqlClient;
using System.Data;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Import;
using Model.Options;

namespace Services.Import
{
    public class ImportIdentifierMappingService : DataImporter.IImportIdentifierMappingService
    {
        readonly ClinDbOptions dbOptions;
        readonly CompilerOptions compilerOptions;
        readonly ILogger<ImportIdentifierMappingService> logger;

        public ImportIdentifierMappingService(
            IOptions<ClinDbOptions> dbOptions,
            IOptions<CompilerOptions> compilerOptions,
            ILogger<ImportIdentifierMappingService> logger
        )
        {
            this.dbOptions = dbOptions.Value;
            this.compilerOptions = compilerOptions.Value;
            this.logger = logger;
        }

        public async Task<(IEnumerable<ImportRecord>, IEnumerable<string>)> MapIds(ImportMappingOptions opts, IEnumerable<ImportRecord> records)
        {
            var output = new List<ImportRecord>();
            var unique = records.Select(r => r.SourcePersonId).Distinct();
            var query = new ImportMappingQuery(compilerOptions, opts, unique).ToString();
            var map = await GetMappingRecords(opts, query);
            var unmapped = new List<string>();

            foreach (var rec in records)
            {
                map.TryGetValue(rec.SourcePersonId, out string mappedId);

                if (mappedId != null)
                {
                    rec.PersonId = mappedId;
                    output.Add(rec);
                }
                else
                {
                    unmapped.Add(rec.SourcePersonId);
                }
            }
            return (output, unmapped);
        }

        async Task<IDictionary<string, string>> GetMappingRecords(ImportMappingOptions opts, string query)
        {
            var map = new Dictionary<string, string>();

            using (var cn = new SqlConnection(dbOptions.ConnectionString))
            {
                await cn.OpenAsync();

                using (var cmd = new SqlCommand(query, cn))
                {
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while(reader.Read())
                        {
                            map.Add(
                                reader[opts.FieldMrn].ToString(), 
                                reader[compilerOptions.FieldPersonId].ToString()
                            );
                        }
                    }
                }
            }

            return map;
        }

        public class MappingRecord
        {
            public string PersonId { get; set; }
            public string SourceMapPersonId { get; set; }

            public MappingRecord(SqlDataReader reader)
            {
                PersonId = reader[0].ToString();
                SourceMapPersonId = reader[1].ToString();
            }
        }
    }
}
