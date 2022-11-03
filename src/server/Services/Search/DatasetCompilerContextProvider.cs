// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Compiler;
using Model.Options;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Data.SqlClient;
using System.Data;
using Dapper;
using Services.Tables;
using Model.Authorization;
using Newtonsoft.Json;

namespace Services.Search
{
    using Hydrator = Func<DatasetExecutionRequest, Task<DatasetCompilerContext>>;

    public class DatasetCompilerContextProvider : DatasetCompilerValidationContextProvider.ICompilerContextProvider
    {
        readonly IUserContext user;
        readonly ILogger<DatasetCompilerContextProvider> log;
        readonly AppDbOptions opts;
        readonly JsonSerializerSettings jsonSettings = new JsonSerializerSettings
        {
            TypeNameHandling = TypeNameHandling.Auto
        };

        public DatasetCompilerContextProvider(
            IUserContext userContext,
            IOptions<AppDbOptions> dbOptions,
            ILogger<DatasetCompilerContextProvider> logger)
        {
            user = userContext;
            log = logger;
            opts = dbOptions.Value;
        }

        public async Task<DatasetCompilerContext> GetCompilerContextAsync(DatasetExecutionRequest request)
        {
            var hydrator = GetHydrator(request);
            var context = await hydrator(request);
            return context;
        }

        Hydrator GetHydrator(DatasetExecutionRequest request)
        {
            if (request.DatasetRef.UseUniversalId())
            {
                if (request.QueryRef.UseUniversalId())
                {
                    return ByDatasetUIdQueryUId;
                }
                return ByDatasetUIdQueryId;
            }
            if (request.QueryRef.UseUniversalId())
            {
                return ByDatasetIdQueryUId;
            }
            return ByDatasetIdQueryId;
        }

        DatasetCompilerContext ReadRequestGrid(SqlMapper.GridReader gridReader, DatasetExecutionRequest request)
        {
            var queryCtx = gridReader.ReadFirstOrDefault<QueryContext>();
            var datasetQueryRecord = request.DatasetRef.Shape == Shape.Dynamic
                ? gridReader.ReadFirstOrDefault<DynamicDatasetQueryRecord>()
                : gridReader.ReadFirstOrDefault<DatasetQueryRecord>();
            var datasetQuery = datasetQueryRecord.DatasetQuery();

            return new DatasetCompilerContext
            {
                DatasetQuery = datasetQuery,
                QueryContext = queryCtx,
                EarlyBound = request.EarlyBound,
                LateBound = request.LateBound,
                Panel = GetPanel(queryCtx.Definition, request.PanelIndex)
            };
        }

        Panel GetPanel(string def, int? idx)
        {
            if (string.IsNullOrWhiteSpace(def) || !idx.HasValue || idx.Value < 0)
            {
                return null;
            }
            var panels = JsonConvert.DeserializeObject<IEnumerable<Panel>>(def, jsonSettings);
            if (panels.Count() >= idx+1)
            {
                return panels.ElementAt(idx.Value);
            }
            return null;
        }

        async Task<DatasetCompilerContext> ByDatasetIdQueryId(DatasetExecutionRequest request)
        {
            log.LogInformation("Getting DatasetQueryCompilerContext by DatasetId and QueryId");
            var datasetid = request.DatasetRef.Id.Value;
            var queryid = request.QueryRef.Id.Value;
            var joinpanel = request.PanelIndex.HasValue;

            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    ContextQuery.byDatasetIdQueryId,
                    new { datasetid, queryid, joinpanel, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadRequestGrid(grid, request);
            }
        }

        async Task<DatasetCompilerContext> ByDatasetIdQueryUId(DatasetExecutionRequest request)
        {
            log.LogInformation("Getting DatasetQueryCompilerContext by DatasetId and QueryUId");
            var datasetid = request.DatasetRef.Id.Value;
            var queryuid = request.QueryRef.UniversalId.ToString();
            var joinpanel = request.PanelIndex.HasValue;

            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    ContextQuery.byDatasetIdQueryUId,
                    new { datasetid, queryuid, joinpanel, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadRequestGrid(grid, request);
            }
        }

        async Task<DatasetCompilerContext> ByDatasetUIdQueryId(DatasetExecutionRequest request)
        {
            log.LogInformation("Getting DatasetQueryCompilerContext by DatasetUId and QueryId");
            var datasetuid = request.DatasetRef.UniversalId.ToString();
            var queryid = request.QueryRef.Id.Value;
            var joinpanel = request.PanelIndex.HasValue;

            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    ContextQuery.byDatasetUIdQueryId,
                    new { datasetuid, queryid, joinpanel, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadRequestGrid(grid, request);
            }
        }

        async Task<DatasetCompilerContext> ByDatasetUIdQueryUId(DatasetExecutionRequest request)
        {
            log.LogInformation("Getting DatasetQueryCompilerContext by DatasetUId and QueryUId");
            var datasetuid = request.DatasetRef.UniversalId.ToString();
            var queryuid = request.QueryRef.UniversalId.ToString();
            var joinpanel = request.PanelIndex.HasValue;

            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    ContextQuery.byDatasetUIdQueryUId,
                    new { datasetuid, queryuid, joinpanel, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadRequestGrid(grid, request);
            }
        }

        static class ContextQuery
        {
            public const string byDatasetIdQueryId = "app.sp_GetDatasetContextById";
            public const string byDatasetIdQueryUId = "app.sp_GetDatasetContextByDatasetIdQueryUId";
            public const string byDatasetUIdQueryId = "app.sp_GetDatasetContextByDatasetUIdQueryId";
            public const string byDatasetUIdQueryUId = "app.sp_GetDatasetContextByDatasetUIdQueryUId";
        }
    }
}
