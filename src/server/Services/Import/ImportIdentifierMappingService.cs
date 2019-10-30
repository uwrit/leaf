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
using Dapper;
using Composure;

namespace Services.Import
{
    public class ImportIdentifierMappingService : DataImporter.IImportIdentifierMappingService
    {
        readonly ClinDbOptions opts;
        readonly CompilerOptions compilerOptions;
        readonly ILogger<ImportIdentifierMappingService> logger;

        public ImportIdentifierMappingService(
            IOptions<ClinDbOptions> opts,
            IOptions<CompilerOptions> compilerOptions,
            ILogger<ImportIdentifierMappingService> logger
        )
        {
            this.opts = opts.Value;
            this.compilerOptions = compilerOptions.Value;
            this.logger = logger;
        }

        public async Task<(IEnumerable<ImportRecord>, IEnumerable<string>)> MapIds(IEnumerable<ImportRecord> records)
        {
            var output = new List<ImportRecord>();
            var unique = records.Select(r => r.SourcePersonId).Distinct();
            var map = await GetMappingRecords(unique);
            var unmapped = new List<string>();

            foreach (var rec in records)
            {
                rec.PersonId = rec.SourcePersonId;
                output.Add(rec);
            }
            return (output, unmapped);

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

        async Task<MappingQuery> GetMappingParameters(SqlConnection cn)
        {
            var queryParams = await cn.QueryFirstOrDefaultAsync<MappingQuery>(
                    Sql.GetImportPatientMappingQuery,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);
            return queryParams;
        }

        async Task<IDictionary<string, string>> GetMappingRecords(IEnumerable<string> ids)
        {
            var map = new Dictionary<string, string>();

            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var queryParams = await GetMappingParameters(cn);
                var query = GetMappingQuery(queryParams, ids);

                using var cmd = new SqlCommand(query, cn);
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (reader.Read())
                    {
                        map.Add(reader[1].ToString(), reader[0].ToString());
                    }
                }
            }

            return map;
        }

        class MappingRecord
        {
            public string PersonId { get; set; }
            public string SourceMapPersonId { get; set; }

            public MappingRecord(SqlDataReader reader)
            {
                PersonId = reader[0].ToString();
                SourceMapPersonId = reader[1].ToString();
            }
        }

        class MappingQuery
        {
            public string SqlStatement { get; set; }
            public string SqlFieldSourceId { get; set; }
        }

        static class Sql
        {
            public static string GetImportPatientMappingQuery = "app.sp_GetImportPatientMappingQuery";
        }

        static class Cols
        {
            public static string PersonId = "PersonId";
            public static string Mrn = "Mrn";
        }

        static string GetMappingQuery(MappingQuery mapping, IEnumerable<string> ids)
        {
            var personId = new Column(Cols.PersonId);
            var mrn = new Column(Cols.Mrn);
            var wrapper = "wrapper";

            var cte = $"WITH {wrapper} ({personId}, {mrn}) AS ({mapping.SqlStatement})";
            var select = new NamedSet
            {
                Select = new[] { personId, mrn },
                From   = wrapper,
                Where  = new[] { mrn == ids }
            };

            return $"{cte} {select}";
        }
    }
}
