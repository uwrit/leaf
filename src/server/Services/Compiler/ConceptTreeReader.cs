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
using Model.Compiler;
using Model.Options;
using Services.Authorization;
using Services.Extensions;
using Services.Tables;

namespace Services.Compiler
{
    /// <summary>
    /// User aware database reader for Concepts.
    /// Provides readonly operations for the concept tree in the database.
    /// </summary>
    public class ConceptTreeReader : IConceptTreeReader
    {
        // TODO(cspital) may not need these anymore
        const string querySingle = @"app.sp_GetConceptById";
        const string queryMany = @"app.sp_GetConceptsByIds";
        const string queryManyUniversal = @"app.sp_GetConceptsByUIds";

        const string queryChildren = @"app.sp_GetChildConceptsByParentId";
        const string queryParents = @"app.sp_GetParentConceptsByChildIds";
        const string queryParentsBySearchTerm = @"app.sp_GetConceptsBySearchTerms";
        const string queryRoots = @"app.sp_GetRootConcepts";
        const string queryRootsPanelFilters = @"app.sp_GetRootsPanelFilters";

        readonly AppDbOptions opts;
        readonly IUserContext user;
        readonly ILogger<ConceptTreeReader> log;

        public ConceptTreeReader(IOptions<AppDbOptions> dbOpts, IUserContext userContext, ILogger<ConceptTreeReader> logger)
        {
            opts = dbOpts.Value;
            user = userContext;
            log = logger;
        }

        // TODO(cspital) change to accept ConceptRef, delegate to internal
        public async Task<Concept> GetAsync(Guid id)
        {
            log.LogInformation("Getting Concept. Id:{Id}", id);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                try
                {
                    var grid = await cn.QueryMultipleAsync(
                        querySingle,
                        new
                        {
                            id,
                            user = user.UUID,
                            groups = GroupMembership.From(user),
                            admin = user.IsAdmin
                        },
                        commandTimeout: opts.DefaultTimeout,
                        commandType: CommandType.StoredProcedure
                    );

                    return HydratedConceptReader.Read(grid).FirstOrDefault();
                }
                catch (SqlException se)
                {
                    log.LogError("Could not get concept by Id. Id:{Id} Error:{Error}", id, se.Message);
                    LeafDbException.ThrowFrom(se);
                    throw;
                }
            }
        }

        public async Task<IEnumerable<Concept>> GetAsync(HashSet<Guid> ids)
        {
            log.LogInformation("Getting Concepts. Ids:{Ids}", ids);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    queryMany,
                    new
                    {
                        ids = ResourceIdTable.From(ids),
                        user = user.UUID,
                        groups = GroupMembership.From(user),
                        admin = user.IsAdmin
                    },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return HydratedConceptReader.Read(grid);
            }
        }

        public async Task<IEnumerable<Concept>> GetAsync(HashSet<string> universalIds)
        {
            log.LogInformation("Getting Universal Concepts. UIds:{UIds}", universalIds);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    queryManyUniversal,
                    new
                    {
                        uids = ResourceUniversalIdTable.From(universalIds),
                        user = user.UUID,
                        groups = GroupMembership.From(user),
                        admin = user.IsAdmin
                    },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return HydratedConceptReader.Read(grid);
            }
        }

        public async Task<IEnumerable<Concept>> GetChildrenAsync(Guid parentId)
        {
            log.LogInformation("Getting child concepts. ParentId:{ParentId}", parentId);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                try
                {
                    var grid = await cn.QueryMultipleAsync(
                        queryChildren,
                        new
                        {
                            parentId,
                            user = user.UUID,
                            groups = GroupMembership.From(user),
                            admin = user.IsAdmin
                        },
                        commandTimeout: opts.DefaultTimeout,
                        commandType: CommandType.StoredProcedure
                    );

                    return HydratedConceptReader.Read(grid);
                }
                catch (SqlException se)
                {
                    log.LogError("Could not get child concepts. ParentId:{ParentId} Error:{Error}", parentId, se.Message);
                    LeafDbException.ThrowFrom(se);
                    throw;
                }
            }
        }

        public async Task<IEnumerable<Concept>> GetWithParentsAsync(HashSet<Guid> ids)
        {
            log.LogInformation("Getting parent concepts for Ids:{Ids}", ids);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                try
                {
                    var grid = await cn.QueryMultipleAsync(
                        queryParents,
                        new
                        {
                            ids = ResourceIdTable.From(ids),
                            user = user.UUID,
                            groups = GroupMembership.From(user),
                            admin = user.IsAdmin
                        },
                        commandTimeout: opts.DefaultTimeout,
                        commandType: CommandType.StoredProcedure
                    );

                    return HydratedConceptReader.Read(grid);
                }
                catch (SqlException se)
                {
                    log.LogError("Could not get rooted concepts of children ids {Ids}. Error:{Error}", ids, se.Message);
                    LeafDbException.ThrowFrom(se);
                    throw;
                }
            }
        }

        public async Task<IEnumerable<Concept>> GetWithParentsBySearchTermAsync(Guid? rootId, string[] terms)
        {
            log.LogInformation("Getting parent concepts by Search Terms:{terms}", terms);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    queryParentsBySearchTerm,
                    new
                    {
                        terms = SearchTermTable.From(terms),
                        rootId,
                        user = user.UUID,
                        groups = GroupMembership.From(user),
                        admin = user.IsAdmin
                    },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return HydratedConceptReader.Read(grid);
            }
        }

        public async Task<IEnumerable<Concept>> GetRootsAsync()
        {
            log.LogInformation("Getting root Concepts");

            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    queryRoots,
                    new { user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                return HydratedConceptReader.Read(grid);
            }
        }

        public async Task<ConceptTree> GetTreetopAsync()
        {
            log.LogInformation("Getting root Concepts and PanelFilters");

            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    queryRootsPanelFilters,
                    new { user = user.UUID, groups = GroupMembership.From(user), admin = user.IsAdmin },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

                var roots = HydratedConceptReader.Read(grid);
                var filterRecords = grid.Read<PanelFilterRecord>();
                var filters = filterRecords.Select(f => f.ToPanelFilter());

                return new ConceptTree
                {
                    PanelFilters = filters,
                    Concepts = roots
                };
            }
        }
    }
}
