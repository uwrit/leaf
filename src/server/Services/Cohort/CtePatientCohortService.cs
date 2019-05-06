// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Cohort;
using Model.Compiler;
using Model.Options;

namespace Services.Cohort
{
    public class CtePatientCohortService : PatientCohortService
    {
        public CtePatientCohortService(
            ISqlCompiler compiler,
            IOptions<ClinDbOptions> clinOpts,
            ILogger<PatientCohortService> logger) : base(compiler, clinOpts, logger)
        {
        }

        protected override async Task<PatientCohort> GetCohortAsync(PatientCountQuery query, CancellationToken token)
        {
            var cteQuery = GetCteQuery(query.Panels);

            return new PatientCohort
            {
                QueryId = query.QueryId,
                PatientIds = await GetPatientSetAsync(cteQuery, token),
                SqlStatements = new string[] { cteQuery.SqlStatement }
            };
        }

        async Task<HashSet<string>> GetPatientSetAsync(ISqlStatement query, CancellationToken token)
        {
            var patientIds = new HashSet<string>();
            using (var cn = new SqlConnection(clinDbOptions.ConnectionString))
            {
                await cn.OpenAsync();

                using (var cmd = new SqlCommand(query.SqlStatement, cn))
                {
                    cmd.CommandTimeout = clinDbOptions.DefaultTimeout;

                    using (var reader = await cmd.ExecuteReaderAsync(token))
                    {
                        while (reader.Read())
                        {
                            patientIds.Add(reader[0].ToString());
                        }
                    }
                }
            }
            return patientIds;
        }

        ISqlStatement GetCteQuery(IEnumerable<Panel> panels)
        {
            var query = compiler.BuildCteSql(panels);
            log.LogInformation("SqlStatement:{Sql}", query.SqlStatement);
            return query;
        }
    }
}
