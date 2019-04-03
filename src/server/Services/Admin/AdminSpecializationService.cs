// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Model.Admin;
using Model.Tagging;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Options;
using System.Data.SqlClient;
using System.Data;
using Dapper;
using Services.Authorization;
using System.Linq;
using Model.Authorization;

namespace Services.Admin
{
    public class AdminSpecializationService : IAdminSpecializationService
    {
        readonly IUserContext user;
        readonly ILogger<AdminSpecializationService> logger;
        readonly AppDbOptions opts;

        public AdminSpecializationService(
            ILogger<AdminSpecializationService> logger,
            IOptions<AppDbOptions> options,
            IUserContext userContext)
        {
            this.logger = logger;
            opts = options.Value;
            user = userContext;
        }

        public async Task<Specialization> Create(Specialization spec)
        {
            logger.LogInformation("Creating Specialization:{@Specialization}", spec);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                try
                {
                    var created = await cn.QueryFirstAsync<SpecializationRecord>(
                        Sql.Create,
                        new
                        {
                            groupId = spec.SpecializationGroupId,
                            uid = spec.UniversalId?.ToString(),
                            uiDisplayText = spec.UiDisplayText,
                            sqlSetWhere = spec.SqlSetWhere,
                            order = spec.OrderId,
                            user = user.UUID
                        },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout
                    );

                    return created.Specialization();
                }
                catch (SqlException se)
                {
                    logger.LogError("Could not create Specialization. Specialization:{@Specialization} Code:{Code} Error:{Error}", spec, se.ErrorCode, se.Message);
                    LeafDbException.ThrowFrom(se);
                    throw;
                }
            }
        }

        public async Task<Specialization> Delete(Guid id)
        {
            logger.LogInformation("Deleting Specialization. Id:{Id}", id);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var deleted = await cn.QueryFirstOrDefaultAsync<SpecializationRecord>(
                    Sql.Delete,
                    new { id, user = user.UUID },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);
                return deleted.Specialization();
            }
        }

        public async Task<IEnumerable<Specialization>> GetByGroupId(int id)
        {
            logger.LogInformation("Getting Specializations. GroupId:{GroupId}", id);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                try
                {
                    var specializations = await cn.QueryAsync<SpecializationRecord>(
                    Sql.Get,
                    new { groupId = id },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout);

                    return specializations.Select(s => s.Specialization());
                }
                catch (SqlException se)
                {
                    logger.LogError("Could not fetch Specializations. SpecializationGroupId:{SpecializationGroupId} Code:{Code} Error:{Error}", id, se.ErrorCode, se.Message);
                    LeafDbException.ThrowFrom(se);
                    throw;
                }

            }
        }

        public async Task<Specialization> Update(Specialization spec)
        {
            logger.LogInformation("Update Specialization:{@Specialization}", spec);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                try
                {
                    var updated = await cn.QueryFirstOrDefaultAsync<SpecializationRecord>(
                        Sql.Update,
                        new
                        {
                            id = spec.Id,
                            groupId = spec.SpecializationGroupId,
                            uid = spec.UniversalId?.ToString(),
                            uiDisplayText = spec.UiDisplayText,
                            sqlSetWhere = spec.SqlSetWhere,
                            order = spec.OrderId,
                            user = user.UUID
                        },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout);
                    return updated.Specialization();
                }
                catch (SqlException se)
                {
                    logger.LogError("Could not update Specialization:{@Specialization}. Code:{Code} Error:{Error}", spec, se.ErrorCode, se.Message);
                    LeafDbException.ThrowFrom(se);
                    throw;
                }
            }
        }

        static class Sql
        {
            public const string Get = "adm.sp_GetSpecializationsByGroupId";
            public const string Update = "adm.sp_UpdateSpecialization";
            public const string Create = "adm.sp_CreateSpecialization";
            public const string Delete = "adm.sp_DeleteSpecialization";
        }
    }

    class SpecializationRecord
    {
        public Guid Id { get; set; }
        public int SpecializationGroupId { get; set; }
        public string UniversalId { get; set; }
        public string UiDisplayText { get; set; }
        public string SqlSetWhere { get; set; }
        public int? OrderId { get; set; }
    }

    static class SpecializationExtensions
    {
        public static Specialization Specialization(this SpecializationRecord r)
        {
            if (r == null) return null;
            return new Specialization
            {
                Id = r.Id,
                SpecializationGroupId = r.SpecializationGroupId,
                UniversalId = SpecializationUrn.From(r.UniversalId),
                UiDisplayText = r.UiDisplayText,
                SqlSetWhere = r.SqlSetWhere,
                OrderId = r.OrderId
            };
        }
    }

}
