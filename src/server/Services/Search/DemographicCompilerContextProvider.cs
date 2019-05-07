// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using Model.Compiler;
using Model.Options;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Data.SqlClient;
using System.Data;
using Dapper;
using Services.Tables;
using Services.Extensions;
using Model.Authorization;
using Model.Search;

namespace Services.Search
{
    using Hydrator = Func<QueryRef, Task<DemographicCompilerContext>>;

    public class DemographicCompilerContextProvider : IDemographicCompilerContextProvider
    {
        const string contextById = @"app.sp_GetDemographicContextById";
        const string contextByUId = @"app.sp_GetDemographicContextByUId";

        readonly IUserContext user;
        readonly AppDbOptions opts;
        readonly ILogger<DemographicCompilerContextProvider> log;

        public DemographicCompilerContextProvider(
            IUserContext userContext,
            IOptions<AppDbOptions> options,
            ILogger<DemographicCompilerContextProvider> logger)
        {
            user = userContext;
            opts = options.Value;
            log = logger;
        }

        public async Task<DemographicCompilerContext> GetCompilerContextAsync(QueryRef queryRef)
        {
            log.LogInformation("Getting DemographicQueryCompilerContext. QueryRef:{@QueryRef}", queryRef);
            var hydrator = GetContextHydrator(queryRef);
            try
            {
                var context = await hydrator(queryRef);
                return context;
            }
            catch (SqlException se)
            {
                log.LogError("Could not get demographic query context. Query:{@QueryRef} Code:{Code} Error:{Error}", queryRef, se.ErrorCode, se.Message);
                se.MapThrow();
                throw;
            }
        }

        Hydrator GetContextHydrator(QueryRef queryRef)
        {
            if (queryRef.UseUniversalId())
            {
                return ByQueryUId;
            }
            return ByQueryId;
        }

        DemographicCompilerContext ReadContextGrid(SqlMapper.GridReader gridReader)
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
                    new { queryid, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadContextGrid(grid);
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
                    new { queryuid, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadContextGrid(grid);
            }
        }
    }
}
