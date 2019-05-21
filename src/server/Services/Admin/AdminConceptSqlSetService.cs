// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Admin;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Options;
using System.Data.SqlClient;
using System.Data;
using Dapper;
using Model.Error;
using Model.Authorization;

namespace Services.Admin
{
    public class AdminConceptSqlSetService : AdminConceptSqlSetManager.IAdminConceptSqlSetService
    {
        readonly IUserContext user;
        readonly ILogger<AdminConceptSqlSetService> logger;
        readonly AppDbOptions opts;

        public AdminConceptSqlSetService(
            ILogger<AdminConceptSqlSetService> logger,
            IOptions<AppDbOptions> options,
            IUserContext userContext)
        {
            this.logger = logger;
            opts = options.Value;
            user = userContext;
        }

        public async Task<ConceptSqlSet> CreateAsync(ConceptSqlSet set)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                var created = await cn.QueryFirstOrDefaultAsync<ConceptSqlSet>(
                        Sql.Create,
                        new
                        {
                            isEncounterBased = set.IsEncounterBased,
                            isEventBased = set.IsEventBased,
                            sqlSetFrom = set.SqlSetFrom,
                            sqlFieldDate = set.SqlFieldDate,
                            sqlFieldEvent = set.SqlFieldEvent,
                            eventId = set.EventId,
                            user = user.UUID
                        },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout
                    );
                return created;
            }
        }

        public async Task<ConceptSqlSetDeleteResult> DeleteAsync(int id)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                        Sql.Delete,
                        new { id, user = user.UUID },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout
                    );
                var concepts = grid.Read<ConceptDependent>();
                var specs = grid.Read<SpecializationGroupDependent>();
                return new ConceptSqlSetDeleteResult { ConceptDependents = concepts, SpecializationGroupDependents = specs };
            }
        }

        public async Task<IEnumerable<ConceptSqlSet>> GetAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                return await cn.QueryAsync<ConceptSqlSet>(
                    Sql.GetAll,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );
            }
        }

        public async Task<ConceptSqlSet> UpdateAsync(ConceptSqlSet set)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                return await cn.QueryFirstOrDefaultAsync<ConceptSqlSet>(
                        Sql.Update,
                        new
                        {
                            id = set.Id,
                            isEncounterBased = set.IsEncounterBased,
                            isEventBased = set.IsEventBased,
                            sqlSetFrom = set.SqlSetFrom,
                            sqlFieldDate = set.SqlFieldDate,
                            sqlFieldEvent = set.SqlFieldEvent,
                            eventId = set.EventId,
                            user = user.UUID
                        },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout
                    );
            }
        }

        static class Sql
        {
            public const string GetAll = "adm.sp_GetConceptSqlSets";
            public const string Update = "adm.sp_UpdateConceptSqlSet";
            public const string Create = "adm.sp_CreateConceptSqlSet";
            public const string Delete = "adm.sp_DeleteConceptSqlSet";
        }
    }
}
