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
    public class AdminConceptEventService : AdminConceptEventManager.IAdminConceptEventService
    {
        readonly IUserContext user;
        readonly ILogger<AdminConceptEventService> logger;
        readonly AppDbOptions opts;

        public AdminConceptEventService(
            ILogger<AdminConceptEventService> logger,
            IOptions<AppDbOptions> options,
            IUserContext userContext)
        {
            this.logger = logger;
            opts = options.Value;
            user = userContext;
        }

        public async Task<ConceptEvent> CreateAsync(ConceptEvent ev)
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var created = await cn.QueryFirstOrDefaultAsync<ConceptEvent>(
                        Sql.Create,
                        new
                        {
                            uiDisplayEventName = ev.UiDisplayEventName,
                            user = user.UUID
                        },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout
                    );
                return created;
            }
        }

        public async Task<ConceptEventDeleteResult> DeleteAsync(int id)
        {
            logger.LogInformation("Deleting ConceptEvent. Id:{Id}", id);
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
                    var sqlSets = grid.Read<ConceptSqlSetDependent>();
                    return new ConceptEventDeleteResult { ConceptSqlSetDependents = sqlSets };
                }
                catch (SqlException se)
                {
                    logger.LogError("Failed to delete ConceptEvent. Id:{Id} Code:{Code} Error:{Error}", id, se.ErrorCode, se.Message);
                    se.MapThrow();
                    throw;
                }
            }
        }

        public async Task<IEnumerable<ConceptEvent>> GetAsync()
        {
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                return await cn.QueryAsync<ConceptEvent>(
                    Sql.GetAll,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );
            }
        }

        public async Task<ConceptEvent> UpdateAsync(ConceptEvent ev)
        {
            logger.LogInformation("Updating ConceptEvent:{@ConceptEvent}", ev);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();
                try
                {
                    return await cn.QueryFirstOrDefaultAsync<ConceptEvent>(
                        Sql.Update,
                        new
                        {
                            id = ev.Id,
                            uiDisplayEventName = ev.UiDisplayEventName,
                            user = user.UUID
                        },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout
                    );
                }
                catch (SqlException se)
                {
                    logger.LogError("Failed to update ConceptEvent:{@ConceptEvent}. Code:{Code} Error:{Error}", ev, se.ErrorCode, se.Message);
                    se.MapThrow();
                    throw;
                }
            }
        }

        static class Sql
        {
            public const string GetAll = "adm.sp_GetConceptEvents";
            public const string Update = "adm.sp_UpdateConceptEvent";
            public const string Create = "adm.sp_CreateConceptEvent";
            public const string Delete = "adm.sp_DeleteConceptEvent";
        }
    }
}
