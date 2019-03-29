// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using Model.Compiler;
using Model.Options;
using Services.Authorization;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Data.SqlClient;
using System.Data;
using Dapper;
using Services.Tables;

namespace Services.Compiler
{
    using Hydrator = Func<QueryRef, Task<DemographicCompilerContext>>;

    public class DemographicQueryService : IDemographicQueryService
    {
        const string queryGet = @"app.sp_GetDemographicQuery";
        const string contextById = @"app.sp_GetDemographicContextById";
        const string contextByUId = @"app.sp_GetDemographicContextByUId";
        const string queryUpdate = @"app.sp_UpdateDemographicQuery";

        readonly IUserContext user;
        readonly AppDbOptions opts;
        readonly ILogger<DemographicQueryService> log;

        public DemographicQueryService(
            IUserContext userContext,
            IOptions<AppDbOptions> options,
            ILogger<DemographicQueryService> logger)
        {
            user = userContext;
            opts = options.Value;
            log = logger;
        }

        public async Task<DemographicQuery> GetDemographicQueryAsync()
        {
            log.LogInformation("Getting DemographicQuery");
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var record = await cn.QuerySingleOrDefaultAsync<DemographicQueryRecord>(
                    queryGet,
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                ThrowIfInvalid(record);

                return record.ToDemographicQuery();
            }
        }

        public async Task<CompilerValidationContext<DemographicCompilerContext>> GetDemographicQueryCompilerContext(QueryRef queryRef)
        {
            log.LogInformation("Getting DemographicQueryCompilerContext. QueryRef:{@QueryRef}", queryRef);
            var hydrator = GetContextHydrator(queryRef);
            try
            {
                var context = await hydrator(queryRef);
                var state = GetContextState(context);
                return new CompilerValidationContext<DemographicCompilerContext>
                {
                    Context = context,
                    State = state
                };
            }
            catch (SqlException se)
            {
                log.LogError("Could not get demographic query context. Query:{@QueryRef} Code:{Code} Error:{Error}", queryRef, se.ErrorCode, se.Message);
                LeafDbException.ThrowFrom(se);
                throw;
            }
        }

        CompilerContextState GetContextState(DemographicCompilerContext context)
        {
            if (context.DemographicQuery == null || string.IsNullOrWhiteSpace(context.DemographicQuery.SqlStatement))
            {
                log.LogError("No demographic query configured in Leaf database.");
                return CompilerContextState.DatasetNotFound;
            }
            if (!context.QueryContext.Found)
            {
                log.LogWarning("Incomplete demographic compiler context. Context:{@Context}", contextById);
                return CompilerContextState.QueryNotFound;
            }
            return CompilerContextState.Ok;
        }

        Hydrator GetContextHydrator(QueryRef queryRef)
        {
            if (queryRef.UseUniversalId())
            {
                return ByQueryUId;
            }
            return ByQueryId;
        }

        DemographicCompilerContext ReadContextGrid(SqlMapper.GridReader gridReader, QueryRef queryRef)
        {
            var queryCtx = gridReader.ReadFirstOrDefault<QueryContext>();
            var demoQuery = gridReader.ReadFirstOrDefault<DemographicQuery>();

            return new DemographicCompilerContext
            {
                QueryContext = queryCtx,
                DemographicQuery = demoQuery
            };
        }

        async Task<DemographicCompilerContext> ByQueryId(QueryRef queryRef)
        {
            log.LogInformation("Getting DemographicQueryCompilerContext by QueryId");
            var queryid = queryRef.Id.Value;
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    contextById,
                    new { queryid, user = user.UUID, groups = GroupMembership.From(user) },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadContextGrid(grid, queryRef);
            }
        }

        async Task<DemographicCompilerContext> ByQueryUId(QueryRef queryRef)
        {
            log.LogInformation("Getting DemographicQueryCompilerContext by QueryUId");
            var queryuid = queryRef.UniversalId.ToString();
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    contextByUId,
                    new { queryuid, user = user.UUID, groups = GroupMembership.From(user) },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadContextGrid(grid, queryRef);
            }
        }

        public async Task<DemographicQuery> UpdateDemographicQueryAsync(DemographicQuery query)
        {
            log.LogInformation("Updating DemographicQuery SqlStatement:{SqlStatement}", query.SqlStatement);

            var record = new DemographicQueryRecord(query);

            ThrowIfInvalid(record);

            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                await cn.ExecuteAsync(
                    queryUpdate,
                    new { sql = record.SqlStatement, user = user.UUID },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return query;
            }
        }

        void ThrowIfInvalid(DemographicQueryRecord record)
        {
            if (record == null)
            {
                throw new InvalidOperationException("The app.DemographicQuery record is missing");
            }

            if (string.IsNullOrWhiteSpace(record.SqlStatement))
            {
                throw new InvalidOperationException("app.DemographicQuery.SqlStatement is empty");
            }
        }
    }
}
