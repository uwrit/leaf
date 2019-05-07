// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Compiler;
using Model.Options;
using Model.Search;
using Model.Tagging;
using Services.Tables;

namespace Services.Search
{
    public class PreflightResourceReader : PreflightResourceChecker.IPreflightResourceReader
    {
        readonly AppDbOptions opts;
        readonly IUserContext user;

        public PreflightResourceReader(
            IOptions<AppDbOptions> options,
            IUserContext userContext)
        {
            opts = options.Value;
            user = userContext;
        }

        public async Task<PreflightResources> GetResourcesByIdsAsync(ResourceRefs refs)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var qids = refs.Queries.Select(q => q.Id.Value);
                var cids = refs.Concepts.Select(c => c.Id.Value);
                var grid = await cn.QueryMultipleAsync(
                    ResourcePreflightSql.byIds,
                    new { qids = ResourceIdTable.From(qids), cids = ResourceIdTable.From(cids), user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return PreflightReader.ReadResourcesByUId(grid, refs.Queries);
            }
        }

        public async Task<PreflightResources> GetResourcesByUniversalIdsAsync(ResourceRefs refs)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var quids = refs.Queries.Select(q => q.UniversalId.ToString()).ToHashSet();
                var cuids = refs.Concepts.Select(q => q.UniversalId.ToString()).ToHashSet();
                var grid = await cn.QueryMultipleAsync(
                    ResourcePreflightSql.byUIds,
                    new { quids = ResourceUniversalIdTable.From(quids), cuids = ResourceUniversalIdTable.From(cuids), user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return PreflightReader.ReadResourcesByUId(grid, refs.Queries);
            }
        }

        public async Task<PreflightConcepts> GetConceptsByIdAsync(Guid conceptId)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    ConceptPreflightSql.singleId,
                    new { id = conceptId, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );
                return PreflightReader.ReadConcepts(grid);
            }
        }

        public async Task<PreflightConcepts> GetConceptsByUniversalIdAsync(Urn universalId)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var conceptId = universalId.ToString();
                var grid = await cn.QueryMultipleAsync(
                    ConceptPreflightSql.singleId,
                    new { id = conceptId, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );
                return PreflightReader.ReadConcepts(grid);
            }
        }

        public async Task<PreflightConcepts> GetConceptsByIdsAsync(HashSet<Guid> conceptIds)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                        ConceptPreflightSql.manyIds,
                        new { ids = ResourceIdTable.From(conceptIds), user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                        commandTimeout: opts.DefaultTimeout,
                        commandType: CommandType.StoredProcedure
                    );

                return PreflightReader.ReadConcepts(grid);
            }
        }

        public async Task<PreflightConcepts> GetConceptsByUniversalIdsAsync(HashSet<string> conceptUids)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                        ConceptPreflightSql.manyUIds,
                        new { uids = ResourceUniversalIdTable.From(conceptUids), user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                        commandTimeout: opts.DefaultTimeout,
                        commandType: CommandType.StoredProcedure
                    );

                return PreflightReader.ReadConcepts(grid);
            }
        }

        static class ConceptPreflightSql
        {
            public const string singleId = @"app.sp_GetPreflightConceptById";
            public const string manyIds = @"app.sp_GetPreflightConceptsByIds";
            public const string singleUId = @"app.sp_GetPreflightConceptByUId";
            public const string manyUIds = @"app.sp_GetPreflightConceptsByUIds";
        }

        static class ResourcePreflightSql
        {
            public const string byIds = @"app.sp_GetPreflightResourcesByIds";
            public const string byUIds = @"app.sp_GetPreflightResourcesByUIds";
        }
    }

    static class PreflightReader
    {
        public static PreflightResources ReadResourcesById(SqlMapper.GridReader grid, IEnumerable<QueryRef> directQueries)
        {
            var pq = ReadQueriesById(grid);
            var pc = ReadConcepts(grid);

            return new PreflightResources(directQueries)
            {
                DirectQueriesCheck = pq,
                DirectConceptsCheck = pc
            };
        }

        public static PreflightResources ReadResourcesByUId(SqlMapper.GridReader grid, IEnumerable<QueryRef> directQueries)
        {
            var pq = ReadQueriesByUId(grid);
            var pc = ReadConcepts(grid);

            return new PreflightResources(directQueries)
            {
                DirectQueriesCheck = pq,
                DirectConceptsCheck = pc
            };
        }

        public static PreflightConcepts ReadConcepts(SqlMapper.GridReader grid)
        {
            var preflight = grid.Read<ConceptPreflightCheckResultRecord>();
            var concepts = HydratedConceptReader.Read(grid);

            return new PreflightConcepts
            {
                PreflightCheck = new ConceptPreflightCheck { Results = preflight.Select(p => p.ConceptPreflightCheckResult()) },
                Concepts = concepts?.ToArray()
            };
        }

        public static PreflightQueries ReadQueriesById(SqlMapper.GridReader grid)
        {
            var records = grid.Read<QueryPreflightCheckResultRecord>();

            var results = records.GroupBy(r => r.QueryId).Project();

            return new PreflightQueries { Results = results };
        }

        public static PreflightQueries ReadQueriesByUId(SqlMapper.GridReader grid)
        {
            var records = grid.Read<QueryPreflightCheckResultRecord>();

            var results = records.GroupBy(r => r.QueryUniversalId).Project();

            return new PreflightQueries { Results = results };
        }

        static IEnumerable<QueryPreflightCheckResult> Project<T>(this IEnumerable<IGrouping<T, QueryPreflightCheckResultRecord>> grouped)
        {
            return grouped.Select(g =>
            {
                var f = g.First();
                return new QueryPreflightCheckResult
                {
                    QueryRef = new QueryRef(f.QueryId, QueryUrn.From(f.QueryUniversalId)),
                    Ver = f.QueryVer,
                    IsPresent = f.QueryIsPresent,
                    IsAuthorized = f.QueryIsAuthorized,
                    ConceptCheck = new ConceptPreflightCheck
                    {
                        Results = g.Select(c => new ConceptPreflightCheckResult
                        {
                            Id = c.ConceptId,
                            UniversalId = ConceptUrn.From(c.ConceptUniversalId),
                            IsPresent = c.ConceptIsPresent,
                            IsAuthorized = c.ConceptIsAuthorized
                        })
                    }
                };
            });
        }
    }
}
