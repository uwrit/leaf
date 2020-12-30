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
        const string contextByQueryIdConceptId = @"app.sp_GetConceptDatasetContextByQueryIdConceptId";
        const string contextByQueryIdConceptUId = @"app.sp_GetConceptDatasetContextByQueryIdConceptUId";
        const string contextByQueryUIdConceptUId = @"app.sp_GetConceptDatasetContextByQueryUIdConceptUId";
        const string contextByQueryUIdConceptId = @"app.sp_GetConceptDatasetContextByQueryUIdConceptId";

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
            var hydrator = GetContextHydrator(queryRef, conceptRef);
            var context = await hydrator(queryRef, conceptRef);
            return context;
        }

        Hydrator GetContextHydrator(QueryRef queryRef, ConceptRef conceptRef)
        {
            if (queryRef.UseUniversalId())
            {
                if (conceptRef.UseUniversalId())
                {
                    return ByQueryUIdConceptUId;
                }
                return ByQueryUIdConceptId;
            }
            else
            {
                if (conceptRef.UseUniversalId())
                {
                    return ByQueryIdConceptUId;
                }
            }
            return ByQueryIdConceptId;
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

        async Task<ConceptDatasetCompilerContext> ByQueryIdConceptId(QueryRef queryRef, ConceptRef conceptRef)
        {
            log.LogInformation("Getting ConceptDatasetCompilerContext by QueryId and ConceptId");
            var queryid = queryRef.Id.Value;
            var conceptid = conceptRef.Id.Value;
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    contextByQueryIdConceptId,
                    new { queryid, conceptid, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadContextGrid(grid);
            }
        }

        async Task<ConceptDatasetCompilerContext> ByQueryIdConceptUId(QueryRef queryRef, ConceptRef conceptRef)
        {
            log.LogInformation("Getting ConceptDatasetCompilerContext by QueryId and ConceptUId");
            var queryid = queryRef.Id.Value;
            var conceptuid = conceptRef.UniversalId.ToString();
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    contextByQueryIdConceptId,
                    new { queryid, conceptuid, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadContextGrid(grid);
            }
        }

        async Task<ConceptDatasetCompilerContext> ByQueryUIdConceptUId(QueryRef queryRef, ConceptRef conceptRef)
        {
            log.LogInformation("Getting ConceptDatasetCompilerContext by QueryUId and ConceptUId");
            var queryuid = queryRef.UniversalId.ToString();
            var uid = conceptRef.UniversalId.ToString();
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    contextByQueryUIdConceptUId,
                    new { queryuid, uid, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadContextGrid(grid);
            }
        }

        async Task<ConceptDatasetCompilerContext> ByQueryUIdConceptId(QueryRef queryRef, ConceptRef conceptRef)
        {
            log.LogInformation("Getting ConceptDatasetCompilerContext by QueryUId and ConceptId");
            var queryuid = queryRef.UniversalId.ToString();
            var conceptid = conceptRef.Id.Value;
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    contextByQueryUIdConceptUId,
                    new { queryuid, conceptid, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadContextGrid(grid);
            }
        }
    }
}
