// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data;
using System.Linq;
using System.Data.SqlClient;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Authorization;
using Model.Compiler;
using Model.Options;
using Services.Tables;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace Services.Search
{
    using Hydrator = Func<QueryRef, int, Task<PanelDatasetCompilerContext>>;

    public class PanelDatasetCompilerContextProvider : PanelDatasetCompilerValidationContextProvider.ICompilerContextProvider
    {
        const string contextById = @"app.sp_GetContextById";
        const string contextByUId = @"app.sp_GetContextByUId";

        readonly IUserContext user;
        readonly AppDbOptions opts;
        readonly ILogger<PanelDatasetCompilerContextProvider> log;
        readonly JsonSerializerSettings jsonSettings = new JsonSerializerSettings
        {
            TypeNameHandling = TypeNameHandling.Auto
        };

        public PanelDatasetCompilerContextProvider(
            IUserContext userContext,
            IOptions<AppDbOptions> options,
            ILogger<PanelDatasetCompilerContextProvider> logger)
        {
            user = userContext;
            opts = options.Value;
            log = logger;
        }

        public async Task<PanelDatasetCompilerContext> GetCompilerContextAsync(QueryRef queryRef, int panelIdx)
        {
            var hydrator = GetContextHydrator(queryRef);
            var context = await hydrator(queryRef, panelIdx);
            return context;
        }

        Hydrator GetContextHydrator(QueryRef queryRef)
        {
            if (queryRef.UseUniversalId())
            {
                return ByQueryUId;
            }
            return ByQueryId;
        }

        PanelDatasetCompilerContext ReadContextGrid(SqlMapper.GridReader gridReader, int panelIdx)
        {
            var queryCtx = gridReader.Read<QueryContext>().FirstOrDefault();

            return new PanelDatasetCompilerContext
            {
                QueryContext = queryCtx,
                Panel = GetPanel(queryCtx.Definition, panelIdx)
            };
        }

        async Task<PanelDatasetCompilerContext> ByQueryId(QueryRef queryRef, int panelIdx)
        {
            log.LogInformation("Getting PanelDatasetCompilerContext by QueryId");
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

                return ReadContextGrid(grid, panelIdx);
            }
        }

        async Task<PanelDatasetCompilerContext> ByQueryUId(QueryRef queryRef, int panelIdx)
        {
            log.LogInformation("Getting PanelDatasetCompilerContext by QueryUId");
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

                return ReadContextGrid(grid, panelIdx);
            }
        }

        Panel GetPanel(string def, int? idx)
        {
            if (string.IsNullOrWhiteSpace(def) || !idx.HasValue || idx.Value < 0)
            {
                return null;
            }
            var panels = JsonConvert.DeserializeObject<IEnumerable<Panel>>(def, jsonSettings);
            if (panels.Count() >= idx + 1)
            {
                return panels.ElementAt(idx.Value);
            }
            return null;
        }
    }
}
