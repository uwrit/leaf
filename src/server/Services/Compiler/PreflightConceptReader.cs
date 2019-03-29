// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Data;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Dapper;
using Services.Authorization;
using Services.Extensions;
using Model.Compiler;
using Model.Options;
using Services.Tables;

// TODO(cspital) replace with IPreflightResourceReader that accepts tables of various resource ids

namespace Services.Compiler
{
    public class PreflightConceptReader : IPreflightConceptReader
    {
        const string querySingleId = @"app.sp_GetPreflightConceptById";
        const string queryManyIds = @"app.sp_GetPreflightConceptsByIds";
        const string querySingleUId = @"app.sp_GetPreflightConceptByUId";
        const string queryManyUIds = @"app.sp_GetPreflightConceptsByUIds";

        readonly AppDbOptions opts;
        readonly IUserContext user;
        readonly ILogger<PreflightConceptReader> log;

        public PreflightConceptReader(IOptions<AppDbOptions> dbOpts, IUserContext userContext, ILogger<PreflightConceptReader> logger)
        {
            opts = dbOpts.Value;
            user = userContext;
            log = logger;
        }

        public async Task<PreflightConcepts> GetAsync(ConceptRef @ref)
        {
            log.LogInformation("Getting preflight concept check. Ref:{@Ref}", @ref);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                if (user.IsInstutional)
                {
                    return await GetAsync(cn, @ref.Id.Value);
                }
                return await GetAsync(cn, @ref.UniversalId.ToString());
            }
        }

        async Task<PreflightConcepts> GetAsync(SqlConnection cn, Guid id)
        {
            var grid = await cn.QueryMultipleAsync(
                    querySingleId,
                    new { id, user = user.UUID, groups = GroupMembership.From(user) },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

            return PreflightReader.ReadConcepts(grid);
        }

        async Task<PreflightConcepts> GetAsync(SqlConnection cn, string uid)
        {
            var grid = await cn.QueryMultipleAsync(
                    querySingleUId,
                    new { uid, user = user.UUID, groups = GroupMembership.From(user) },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

            return PreflightReader.ReadConcepts(grid);
        }

        public async Task<PreflightConcepts> GetAsync(HashSet<ConceptRef> refs)
        {
            log.LogInformation("Getting preflight check concepts. Refs:{@Refs}", refs);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                if (user.IsInstutional)
                {
                    return await GetAsync(cn, refs.Select(r => r.Id.Value).ToHashSet());
                }
                return await GetAsync(cn, refs.Select(r => r.UniversalId.ToString()).ToHashSet());
            }
        }

        async Task<PreflightConcepts> GetAsync(SqlConnection cn, HashSet<Guid> ids)
        {
            var grid = await cn.QueryMultipleAsync(
                    queryManyIds,
                    new { ids = ResourceIdTable.From(ids), user = user.UUID, groups = GroupMembership.From(user) },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

            return PreflightReader.ReadConcepts(grid);
        }

        async Task<PreflightConcepts> GetAsync(SqlConnection cn, HashSet<string> uids)
        {
            var grid = await cn.QueryMultipleAsync(
                    queryManyUIds,
                    new { uids = ResourceUniversalIdTable.From(uids), user = user.UUID, groups = GroupMembership.From(user) },
                    commandTimeout: opts.DefaultTimeout,
                    commandType: CommandType.StoredProcedure
                );

            return PreflightReader.ReadConcepts(grid);
        }
    }
}
