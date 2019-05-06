// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Cohort;
using Model.Compiler;
using Model.Options;

namespace Services.Cohort
{
    public class ParallelPatientCohortService : PatientCohortService
    {
        readonly PatientCountAggregator patientCountAggregator;

        public ParallelPatientCohortService(
            ISqlCompiler compiler,
            PatientCountAggregator patientCountAggregator,
            IOptions<ClinDbOptions> clinOpts,
            ILogger<PatientCohortService> logger) : base(compiler, clinOpts, logger)
        {
            this.patientCountAggregator = patientCountAggregator;
        }

        protected override async Task<PatientCohort> GetCohortAsync(PatientCountQuery query, CancellationToken token)
        {
            var leafQueries = GetLeafQueries(query.Panels);

            return new PatientCohort
            {
                QueryId = query.QueryId,
                PatientIds = await GetPatientSetAsync(leafQueries, token),
                SqlStatements = leafQueries.Select(q => q.SqlStatement)
            };
        }

        async Task<HashSet<string>> GetPatientSetAsync(IReadOnlyCollection<LeafQuery> queries, CancellationToken token)
        {
            var all = queries.Select(q => GetPartialContext(q, token));
            var partials = await Task.WhenAll(all);

            token.ThrowIfCancellationRequested();

            return patientCountAggregator.Aggregate(partials);
        }

        async Task<PartialPatientCountContext> GetPartialContext(LeafQuery query, CancellationToken token)
        {
            var partialIds = new HashSet<string>();
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
                            partialIds.Add(reader[0].ToString());
                        }
                    }
                }
            }
            return new PartialPatientCountContext
            {
                PatientIds = partialIds,
                IsInclusionCriteria = query.IsInclusionCriteria
            };
        }

        IReadOnlyCollection<LeafQuery> GetLeafQueries(IEnumerable<Panel> panels)
        {
            var newline = Environment.NewLine;
            var clientSql = new StringBuilder();
            var queries = new List<LeafQuery>();

            foreach (var p in panels)
            {
                var q = new LeafQuery
                {
                    IsInclusionCriteria = p.IncludePanel,
                    SqlStatement = compiler.BuildPanelSql(p)
                };

                var status = q.IsInclusionCriteria ? "Included" : "Excluded";
                clientSql.Append($"/* {p.Domain} - {status} */ {newline}{q.SqlStatement}{newline}{newline}");
                queries.Add(q);
            }

            log.LogInformation("SqlStatements:{Sql}", clientSql.ToString());

            return queries;
        }
    }
}
