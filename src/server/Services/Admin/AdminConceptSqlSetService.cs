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
using Services.Authorization;

namespace Services.Admin
{
    public class AdminConceptSqlSetService : IAdminConceptSqlSetService
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

        public async Task<ConceptSqlSet> Create(ConceptSqlSet set)
        {
            logger.LogInformation("Creating ConceptSqlSet:{@ConceptSqlSet}", set);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                try
                {
                    var created = await cn.QueryFirstOrDefaultAsync<ConceptSqlSet>(
                        Sql.Create,
                        new
                        {
                            id = set.Id,
                            isEncounterBased = set.IsEncounterBased,
                            isEventBased = set.IsEventBased,
                            sqlSetFrom = set.SqlSetFrom,
                            sqlFieldDate = set.SqlFieldDate,
                            sqlFieldEventId = set.SqlFieldEventId,
                            user = user.UUID
                        },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout
                    );
                    logger.LogInformation("Created ConceptSqlSet:{@ConceptSqlSet}", set);
                    return created;
                }
                catch (SqlException se)
                {
                    logger.LogError("Could not create ConceptSqlSet:{@ConceptSqlSet}. Code:{Code} Error:{Error}", set, se.ErrorCode, se.Message);
                    LeafDbException.ThrowFrom(se);
                    throw;
                }
            }
        }

        public async Task<ConceptSqlSetDeleteResult> Delete(int id)
        {
            logger.LogInformation("Deleting ConceptSqlSet. Id:{Id}", id);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                try
                {
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
                catch (SqlException se)
                {
                    logger.LogError("Could not delete ConceptSqlSet. Id:{Id} Code:{Code} Error:{Error}", id, se.ErrorCode, se.Message);
                    LeafDbException.ThrowFrom(se);
                    throw;
                }
            }
        }

        public async Task<IEnumerable<ConceptSqlSet>> Get()
        {
            logger.LogInformation("Getting all ConceptSqlSets");
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

        public async Task<ConceptSqlSet> Update(ConceptSqlSet set)
        {
            logger.LogInformation("Updating ConceptSqlSet:{@ConceptSqlSet}", set);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                try
                {
                    return await cn.QueryFirstOrDefaultAsync<ConceptSqlSet>(
                        Sql.Update,
                        new
                        {
                            id = set.Id,
                            isEncounterBased = set.IsEncounterBased,
                            isEventBased = set.IsEventBased,
                            sqlSetFrom = set.SqlSetFrom,
                            sqlFieldDate = set.SqlFieldDate,
                            sqlFieldEventId = set.SqlFieldEventId,
                            user = user.UUID
                        },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout
                    );
                }
                catch (SqlException se)
                {
                    logger.LogError("Could not update ConceptSqlSet:{@ConceptSqlSet}. Code:{Code} Error:{Error}", set, se.ErrorCode, se.Message);
                    LeafDbException.ThrowFrom(se);
                    throw;
                }
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
