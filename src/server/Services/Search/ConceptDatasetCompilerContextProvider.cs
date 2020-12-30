// Copyright (c) 2020, UW Medicine Research IT, University of Washington
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

namespace Services.Search
{
    using Hydrator = Func<QueryRef, ConceptRef, Task<ConceptDatasetCompilerContext>>;

    public class ConceptDatasetCompilerContextProvider : ConceptDatasetCompilerValidationContextProvider.ICompilerContextProvider
    {
        const string contextById = @"app.sp_GetConceptDatasetContextById";
        const string contextByUId = @"app.sp_GetConceptDatasetContextByUId";

        readonly IUserContext user;
        readonly AppDbOptions opts;
        readonly ILogger<ConceptDatasetCompilerContextProvider> log;

        public ConceptDatasetCompilerContextProvider(
            IUserContext userContext,
            IOptions<AppDbOptions> options,
            ILogger<ConceptDatasetCompilerContextProvider> logger)
        {
            user = userContext;
            opts = options.Value;
            log = logger;
        }

        public async Task<ConceptDatasetCompilerContext> GetCompilerContextAsync(QueryRef queryRef, ConceptRef conceptRef)
        {
            var hydrator = GetContextHydrator(queryRef);
            var context = await hydrator(queryRef, conceptRef);
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

        ConceptDatasetCompilerContext ReadContextGrid(SqlMapper.GridReader gridReader)
        {
            var queryCtx = gridReader.Read<QueryContext>().FirstOrDefault();
            var concept = HydratedConceptReader.Read(gridReader).FirstOrDefault();

            return new ConceptDatasetCompilerContext
            {
                QueryContext = queryCtx,
                Concept = concept
            };
        }

        async Task<ConceptDatasetCompilerContext> ByQueryId(QueryRef queryRef, ConceptRef conceptRef)
        {
            log.LogInformation("Getting ConceptDatasetCompilerContext by QueryId");
            var queryid = queryRef.Id.Value;
            var conceptid = conceptRef.Id.Value;
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    contextById,
                    new { queryid, conceptid, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadContextGrid(grid);
            }
        }

        async Task<ConceptDatasetCompilerContext> ByQueryUId(QueryRef queryRef, ConceptRef conceptRef)
        {
            log.LogInformation("Getting ConceptDatasetCompilerContext by QueryUId");
            var queryuid = queryRef.UniversalId.ToString();
            var uid = conceptRef.UniversalId.ToString();
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    contextByUId,
                    new { queryuid, uid, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadContextGrid(grid);
            }
        }
    }
}
