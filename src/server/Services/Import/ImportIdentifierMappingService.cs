// Copyright (c) 2021, UW Medicine Research IT, University of Washington
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
        readonly ClinDbOptions clinDbOpts;
        readonly AppDbOptions appDbOpts;
        readonly CompilerOptions opts;
        readonly ILogger<ImportIdentifierMappingService> logger;

        public ImportIdentifierMappingService(
            IOptions<ClinDbOptions> clinDbOpts,
            IOptions<AppDbOptions> appDbOpts,
            IOptions<CompilerOptions> opts,
            IOptions<CompilerOptions> compilerOptions,
            ILogger<ImportIdentifierMappingService> logger
        )
        {
            this.clinDbOpts = clinDbOpts.Value;
            this.appDbOpts = appDbOpts.Value;
            this.opts = opts.Value;
            this.logger = logger;
        }

        public async Task<(IEnumerable<ImportRecord>, IEnumerable<string>)> MapIds(IEnumerable<ImportRecord> records)
        {
            var output = new List<ImportRecord>();
            var unique = records.Select(r => r.SourcePersonId).Distinct();
            var map = await GetMappingRecords(unique);
            var unmapped = new List<string>();
            var seen = new HashSet<string>();

            foreach (var rec in records)
            {
                map.TryGetValue(rec.SourcePersonId, out string mappedId);

                if (mappedId != null)
                {
                    rec.PersonId = mappedId;
                    var idx = $"{rec.PersonId}_{rec.Id}";

                    if (!seen.Contains(idx))
                    {
                        output.Add(rec);
                        seen.Add(idx);
                    }
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
                    commandTimeout: clinDbOpts.DefaultTimeout);
            return queryParams;
        }

        async Task<IDictionary<string, string>> GetMappingRecords(IEnumerable<string> ids)
        {
            var map = new Dictionary<string, string>();
            var query = "";

            using (var cn = new SqlConnection(appDbOpts.ConnectionString))
            {
                await cn.OpenAsync();
                var queryParams = await GetMappingParameters(cn);
                query = GetMappingQuery(queryParams, ids);
            }

            using (var cn = new SqlConnection(clinDbOpts.ConnectionString))
            {
                await cn.OpenAsync();
                using var cmd = new SqlCommand(query, cn);
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (reader.Read())
                    {
                        var mrn = reader[Cols.Mrn].ToString();
                        if (!map.ContainsKey(mrn))
                        {
                            map.Add(mrn, reader[Cols.PersonId].ToString());
                        }
                    }
                }
            }

            return map;
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
