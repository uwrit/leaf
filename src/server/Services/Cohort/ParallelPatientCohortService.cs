// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
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
        readonly ClinDbOptions clinDbOpts;

        public ParallelPatientCohortService(
            ISqlCompiler compiler,
            ISqlProviderQueryExecutor executor,
            PatientCountAggregator patientCountAggregator,
            IOptions<ClinDbOptions> clinOpts,
            ILogger<PatientCohortService> logger) : base(compiler, executor, clinOpts, logger)
        {
            this.patientCountAggregator = patientCountAggregator;
            this.clinDbOpts = clinOpts.Value;
        }

        protected override async Task<PatientCohort> GetCohortAsync(PatientCountQuery query, CancellationToken token)
        {
            var leafQueries = GetLeafQueries(query.Panels);

            return new PatientCohort
            {
                QueryId = query.QueryId,
                PatientIds = await GetPatientSetAsync(leafQueries, token),
                SqlStatements = leafQueries.Select(q => q.SqlStatement),
                Panels = query.Panels.Where(p => p.Domain == PanelDomain.Panel)
            };
        }

        async Task<HashSet<string>> GetPatientSetAsync(IReadOnlyCollection<LeafQuery> queries, CancellationToken token)
        {
            var partials = new ConcurrentBag<PartialPatientCountContext>();
            var tasks = new List<Task>();
            using (var throttler = new SemaphoreSlim(clinDbOpts.Cohort.MaxParallelThreads))
            {
                foreach (var q in queries)
                {
                    await throttler.WaitAsync();
                    tasks.Add(
                        Task.Run(async () =>
                        {
                            var result = await GetPartialContext(q, token);
                            throttler.Release();
                            partials.Add(result);
                        })
                    );
                }
                await Task.WhenAll(tasks);
            }
            token.ThrowIfCancellationRequested();

            return patientCountAggregator.Aggregate(partials);
        }

        async Task<PartialPatientCountContext> GetPartialContext(LeafQuery query, CancellationToken token)
        {
            var partialIds = new HashSet<string>();
            var reader = await executor.ExecuteReaderAsync(clinDbOptions.ConnectionString, query.SqlStatement, clinDbOptions.DefaultTimeout, token);

            while (reader.Read())
            {
                partialIds.Add(reader[0].ToString());
            }

            await reader.CloseAsync();

            return new PartialPatientCountContext
            {
                PatientIds = partialIds,
                IsInclusionCriteria = query.IsInclusionCriteria
            };
        }

        IReadOnlyCollection<LeafQuery> GetLeafQueries(IEnumerable<Panel> panels)
        {
            var queries = new List<LeafQuery>();
            var parameters = compiler.BuildContextParameterSql();

            foreach (var p in panels)
            {
                var q = new LeafQuery
                {
                    IsInclusionCriteria = p.IncludePanel,
                    SqlStatement = $"{parameters} {compiler.BuildPanelSql(p)}"
                };

                queries.Add(q);
            }

            log.LogInformation("Parallel SqlStatements:{Sql}", queries);

            return queries;
        }
    }
}
