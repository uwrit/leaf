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
using System.Collections.Generic;

namespace Services.Search
{
    using Hydrator = Func<ConceptDatasetExecutionRequest, ConceptRef, Task<PanelDatasetCompilerContext>>;

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
            IUserContextProvider userContextProvider,
            IOptions<AppDbOptions> options,
            ILogger<ConceptDatasetCompilerContextProvider> logger)
        {
            user = userContextProvider.GetUserContext();
            opts = options.Value;
            log = logger;
        }

        public async Task<PanelDatasetCompilerContext> GetCompilerContextAsync(ConceptDatasetExecutionRequest request)
        {
            var conceptRef = new ConceptRef(request.PanelItem.Resource);
            var hydrator = GetContextHydrator(request.QueryRef, conceptRef);
            var context = await hydrator(request, conceptRef);
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

        PanelDatasetCompilerContext ReadContextGrid(ConceptDatasetExecutionRequest request, SqlMapper.GridReader gridReader)
        {
            var queryCtx = gridReader.Read<QueryContext>().FirstOrDefault();
            var concept = HydratedConceptReader.Read(gridReader).FirstOrDefault();
            var pi = request.PanelItem;
            var panel = new Panel
            {
                SubPanels = new List<SubPanel>
                {
                    new SubPanel
                    {
                        PanelItems = new List<PanelItem>
                        {
                            pi.PanelItem(concept)
                        }
                    }
                }
            };

            if (request.EarlyBound != null && request.LateBound != null)
            {
                panel.DateFilter = new DateBoundary
                {
                    Start = new DateFilter { Date = (DateTime)request.EarlyBound, DateIncrementType = DateIncrementType.Specific },
                    End = new DateFilter { Date = (DateTime)request.LateBound, DateIncrementType = DateIncrementType.Specific }
                };
            }

            return new PanelDatasetCompilerContext
            {
                QueryContext = queryCtx,
                Panel = panel
            };
        }

        async Task<PanelDatasetCompilerContext> ByQueryIdConceptId(ConceptDatasetExecutionRequest request, ConceptRef conceptRef)
        {
            log.LogInformation("Getting ConceptDatasetCompilerContext by QueryId and ConceptId");
            var queryid = request.QueryRef.Id.Value;
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

                return ReadContextGrid(request, grid);
            }
        }

        async Task<PanelDatasetCompilerContext> ByQueryIdConceptUId(ConceptDatasetExecutionRequest request, ConceptRef conceptRef)
        {
            log.LogInformation("Getting ConceptDatasetCompilerContext by QueryId and ConceptUId");
            var queryid = request.QueryRef.Id.Value;
            var conceptuid = conceptRef.UniversalId.ToString();
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    contextByQueryIdConceptUId,
                    new { queryid, conceptuid, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadContextGrid(request, grid);
            }
        }

        async Task<PanelDatasetCompilerContext> ByQueryUIdConceptUId(ConceptDatasetExecutionRequest request, ConceptRef conceptRef)
        {
            log.LogInformation("Getting ConceptDatasetCompilerContext by QueryUId and ConceptUId");
            var queryuid = request.QueryRef.UniversalId.ToString();
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

                return ReadContextGrid(request, grid);
            }
        }

        async Task<PanelDatasetCompilerContext> ByQueryUIdConceptId(ConceptDatasetExecutionRequest request, ConceptRef conceptRef)
        {
            log.LogInformation("Getting ConceptDatasetCompilerContext by QueryUId and ConceptId");
            var queryuid = request.QueryRef.UniversalId.ToString();
            var conceptid = conceptRef.Id.Value;
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    contextByQueryUIdConceptId,
                    new { queryuid, conceptid, user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return ReadContextGrid(request, grid);
            }
        }
    }
}
