// Copyright (c) 2021, UW Medicine Research IT, University of Washington
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
using Model.Tagging;
using Services.Tables;
using Model.Error;
using Model.Search;

namespace Services.Search
{
    public class QueryService : IQueryService
    {
        const string queryQueries = @"app.sp_GetSavedBaseQueriesByConstraint";
        const string queryQueryByUId = @"app.sp_GetSavedQueryByUId";
        const string initialQuerySave = @"app.sp_QuerySaveInitial";
        const string upsertQuerySave = @"app.sp_QuerySaveUpsert";
        const string deleteQuery = @"app.sp_DeleteQuery";

        readonly IUserContext user;
        readonly AppDbOptions dbOpts;

        public QueryService(
            IUserContext user,
            IOptions<AppDbOptions> dbOpts
        )
        {
            this.user = user;
            this.dbOpts = dbOpts.Value;
        }

        public async Task<QueryDeleteResult> DeleteAsync(QueryUrn uid, bool force)
        {
            using (var cn = new SqlConnection(dbOpts.ConnectionString))
            {
                await cn.OpenAsync();

                var dependents = await cn.QueryAsync<QueryDependentRecord>(
                        deleteQuery,
                        new { uid = uid.ToString(), force, user = user.UUID, admin = user.IsAdmin },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: dbOpts.DefaultTimeout
                    );

                return QueryDeleteResult.From(dependents.Select(d =>
                {
                    return new QueryDependent(d.Id, QueryUrn.From(d.UniversalId), d.Name, d.Owner);
                }));
            }
        }

        public async Task<IEnumerable<BaseQuery>> GetQueriesAsync()
        {
            using (var cn = new SqlConnection(dbOpts.ConnectionString))
            {
                await cn.OpenAsync();

                var records = await cn.QueryAsync<BaseQueryRecord>(
                    queryQueries,
                    new { user = user.UUID, groups = GroupMembership.From(user) },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOpts.DefaultTimeout
                );

                return records.Select(r => new BaseQuery
                {
                    Id = r.Id,
                    UniversalId = QueryUrn.From(r.UniversalId),
                    Name = r.Name,
                    Category = r.Category,
                    Owner = r.Owner,
                    Created = r.Created,
                    Updated = r.Updated,
                    Count = r.Count
                });
            }
        }

        public async Task<Query> GetQueryAsync(QueryUrn uid)
        {
            using (var cn = new SqlConnection(dbOpts.ConnectionString))
            {
                await cn.OpenAsync();

                var r = await cn.QueryFirstOrDefaultAsync<QueryRecord>(
                    queryQueryByUId,
                    new { uid = uid.ToString(), user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOpts.DefaultTimeout
                );

                return new Query
                {
                    Id = r.Id,
                    UniversalId = QueryUrn.From(r.UniversalId),
                    Name = r.Name,
                    Category = r.Category,
                    Owner = r.Owner,
                    Created = r.Created,
                    Updated = r.Updated,
                    Count = r.Count,
                    Definition = r.Definition
                };
            }
        }

        public async Task<QuerySaveResult> InitialSaveAsync(QuerySave query)
        {
            var urn = QueryUrn.Create(query.QueryId);
            var conceptids = query.Resources.Concepts.Select(c => c.Id.Value).Where(c => c != Guid.Empty);
            var queryids = query.Resources.Queries.Select(q => q.Id.Value);
            using (var cn = new SqlConnection(dbOpts.ConnectionString))
            {
                await cn.OpenAsync();

                var qsr = await cn.QueryFirstOrDefaultAsync<QuerySaveResultRecord>(
                    initialQuerySave,
                    new
                    {
                        queryid = query.QueryId,
                        urn = urn.ToString(),
                        name = query.Name,
                        category = query.Category,
                        conceptids = ResourceIdTable.From(conceptids),
                        queryids = ResourceIdTable.From(queryids),
                        definition = query.Definition,
                        user = user.UUID
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOpts.DefaultTimeout
                );

                if (qsr == null)
                {
                    return null;
                }

                return new QuerySaveResult(query.QueryId, QueryUrn.From(qsr.UniversalId), qsr.Ver);
            }
        }

        public async Task<QuerySaveResult> UpsertSaveAsync(QuerySave query)
        {
            var conceptids = query.Resources.Concepts.Select(c => c.Id.Value).Where(c => c != Guid.Empty);
            var queryids = query.Resources.Queries.Select(q => q.Id.Value);
            using (var cn = new SqlConnection(dbOpts.ConnectionString))
            {
                await cn.OpenAsync();

                var qsr = await cn.QueryFirstOrDefaultAsync<QuerySaveResultRecord>(
                    upsertQuerySave,
                    new
                    {
                        queryid = query.QueryId,
                        urn = query.UniversalId.ToString(),
                        ver = query.Ver,
                        name = query.Name,
                        category = query.Category,
                        conceptids = ResourceIdTable.From(conceptids),
                        queryids = ResourceIdTable.From(queryids),
                        definition = query.Definition,
                        user = user.UUID,
                        admin = user.IsAdmin
                    },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: dbOpts.DefaultTimeout
                );

                if (qsr == null)
                {
                    return null;
                }

                return new QuerySaveResult(query.QueryId, QueryUrn.From(qsr.UniversalId), qsr.Ver);
            }
        }
    }

    class QuerySaveResultRecord
    {
        public string UniversalId { get; set; }
        public int Ver { get; set; }
    }

    class BaseQueryRecord
    {
        public Guid Id { get; set; }
        public string UniversalId { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string Owner { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
        public int? Count { get; set; }
    }

    class QueryRecord : BaseQueryRecord
    {
        public string Definition { get; set; }
    }

    class QueryDependentRecord
    {
        public Guid Id { get; set; }
        public string UniversalId { get; set; }
        public string Name { get; set; }
        public string Owner { get; set; }
    }
}
