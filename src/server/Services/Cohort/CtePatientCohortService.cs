// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
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
            IPanelSqlCompiler compiler,
            ISqlProviderQueryExecutor executor,
            ICachedCohortPreparer cohortPreparer,
            IOptions<ClinDbOptions> clinOpts,
            IOptions<CompilerOptions> compilerOpts,
            ILogger<PatientCohortService> logger) : base(compiler, executor, cohortPreparer, clinOpts, compilerOpts, logger)
        {
        }

        protected override async Task<PatientCohort> GetCohortAsync(PatientCountQuery query, CancellationToken token)
        {
            var cteQuery = GetCteQuery(query.Panels);

            return new PatientCohort
            {
                QueryId = query.QueryId,
                PatientIds = await GetPatientSetAsync(cteQuery, query.DependentQueryIds, token),
                SqlStatements = new string[] { cteQuery.SqlStatement },
                Panels = query.Panels.Where(p => p.Domain == PanelDomain.Panel)
            };
        }

        async Task<HashSet<string>> GetPatientSetAsync(ISqlStatement query, IEnumerable<Guid> queryIds, CancellationToken token)
        {
            var dependentCohortSql = await GetCrossServerDependentCohortSqlIfNeeded(queryIds);
            var patientIds = new HashSet<string>();
            var reader = await executor.ExecuteReaderAsync(clinDbOptions.ConnectionString, dependentCohortSql + query.SqlStatement,
                                                           clinDbOptions.DefaultTimeout, token);

            while (reader.Read())
            {
                patientIds.Add(reader[0].ToString().Trim());
            }

            await reader.CloseAsync();

            return patientIds;
        }

        ISqlStatement GetCteQuery(IEnumerable<Panel> panels)
        {
            var query = compiler.BuildCteSql(panels);
            log.LogInformation("CTE SqlStatement:{Sql}", query.SqlStatement);
            return query;
        }

        async Task<string> GetCrossServerDependentCohortSqlIfNeeded(IEnumerable<Guid> queryIds)
        {
            if (!compilerOpts.SharedDbServer && queryIds.Any())
            {
                return await cohortPreparer.Prepare(queryIds, false);
            }
            return "";
        }
    }
}
