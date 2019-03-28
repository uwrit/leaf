// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Services.Authorization;
using Model.Options;
using Model.Tagging;
using System.Data;
using System.Data.SqlClient;
using Dapper;
using Services.Tables;

namespace Services.Compiler
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
        readonly ILogger<QueryService> logger;

        public QueryService(
            IUserContext userContext,
            IOptions<AppDbOptions> dbOpts,
            ILogger<QueryService> logger
        )
        {
            user = userContext;
            this.dbOpts = dbOpts.Value;
            this.logger = logger;
        }

        public async Task<QueryDeleteResult> Delete(QueryUrn uid, bool force)
        {
            logger.LogInformation("Deleting query. Query:{Query}", uid.ToString());
            using (var cn = new SqlConnection(dbOpts.ConnectionString))
            {
                await cn.OpenAsync();

                try
                {
                    var dependents = await cn.QueryAsync<QueryDependentRecord>(
                        deleteQuery,
                        new { uid = uid.ToString(), force, user = user.UUID },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: dbOpts.DefaultTimeout
                    );

                    return QueryDeleteResult.From(dependents.Select(d =>
                    {
                        return new QueryDependent(d.Id, QueryUrn.From(d.UniversalId), d.Name, d.Owner);
                    }));
                }
                catch (SqlException se)
                {
                    logger.LogError("Could not delete query. Query:{Query} Code:{Code} Error:{Error}", uid.ToString(), se.ErrorCode, se.Message);
                    LeafDbException.ThrowFrom(se);
                    throw;
                }
            }
        }

        public async Task<IEnumerable<BaseQuery>> GetQueries()
        {
            logger.LogInformation("Getting queries");
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

        public async Task<Query> GetQuery(QueryUrn uid)
        {
            logger.LogInformation("Getting query UId:{UId}", uid);
            using (var cn = new SqlConnection(dbOpts.ConnectionString))
            {
                await cn.OpenAsync();

                try
                {
                    var r = await cn.QueryFirstOrDefaultAsync<QueryRecord>(
                        queryQueryByUId,
                        new { uid = uid.ToString(), user = user.UUID, groups = GroupMembership.From(user) },
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
                catch (SqlException se)
                {
                    logger.LogError("Could not get query. UniversalId:{UniversalId} Code:{Code} Error:{Error}", uid, se.ErrorCode, se.Message);
                    LeafDbException.ThrowFrom(se);
                    throw;
                }
            }
        }

        public async Task<QuerySaveResult> Save(QuerySave query)
        {
            if (query.UniversalId == null)
            {
                return await InitialSave(query);
            }
            return await UpsertSave(query);
        }

        async Task<QuerySaveResult> InitialSave(QuerySave query)
        {
            var urn = QueryUrn.Create(query.QueryId);
            var conceptids = query.Resources.Concepts.Select(c => c.Id.Value);
            var queryids = query.Resources.Queries.Select(q => q.Id.Value);
            try
            {
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
            catch (SqlException se)
            {
                logger.LogError("Could not save query. Query:{@Query} Code:{Code} Error:{Error}", query, se.ErrorCode, se.Message);
                LeafDbException.ThrowFrom(se);
                throw;
            }
        }

        async Task<QuerySaveResult> UpsertSave(QuerySave query)
        {
            var conceptids = query.Resources.Concepts.Select(c => c.Id.Value);
            var queryids = query.Resources.Queries.Select(q => q.Id.Value);
            try
            {
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
            catch (SqlException se)
            {
                logger.LogError("Could not save query. Query:{@Query} Code:{Code} Error:{Error}", query, se.ErrorCode, se.Message);
                LeafDbException.ThrowFrom(se);
                throw;
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
