// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Data;
using System.Data.SqlClient;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Model.Options;
using Model.Compiler;
using Model.Cohort;
using Services.Compiler;
using Services.Authorization;
using Services.Extensions;
using Services.Cohort;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Security.Claims;

namespace Services.Cohort
{
    public class CtePatientCountService : PatientCountService
    {
        public CtePatientCountService(
            ISqlCompiler compiler,
            ICohortCacheService cohortCacheService,
            IUserContext userContext,
            IOptions<ClinDbOptions> clinOpts,
            ILogger<PatientCountService> logger) : base(compiler, cohortCacheService, userContext, clinOpts, logger)
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

        ISqlStatement GetCteQuery(IReadOnlyCollection<Panel> panels)
        {
            var query = compiler.BuildCteSql(panels);
            log.LogInformation("SqlStatement:{Sql}", query.SqlStatement);
            return query;
        }
    }
}
