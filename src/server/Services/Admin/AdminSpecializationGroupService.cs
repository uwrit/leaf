﻿// Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
using Model.Error;
using Services.Tables;
using System.Linq;
using Model.Authorization;

namespace Services.Admin
{
    public class AdminSpecializationGroupService : IAdminSpecializationGroupService
    {
        readonly IUserContext user;
        readonly ILogger<AdminSpecializationGroupService> logger;
        readonly AppDbOptions opts;

        public AdminSpecializationGroupService(
            ILogger<AdminSpecializationGroupService> logger,
            IOptions<AppDbOptions> options,
            IUserContext userContext)
        {
            this.logger = logger;
            opts = options.Value;
            user = userContext;
        }

        public async Task<SpecializationGroup> Create(SpecializationGroup g)
        {
            logger.LogInformation("Creating SpecializationGroup:{@SpecializationGroup}", g);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                try
                {
                    var grid = await cn.QueryMultipleAsync(
                        Sql.Create,
                        new
                        {
                            sqlSetId = g.SqlSetId,
                            uiDefaultText = g.UiDefaultText,
                            specs = SpecializationTable.From(g),
                            user = user.UUID
                        },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout);
                    return HydratedSpecializationGroupReader.ReadSingle(grid);
                }
                catch (SqlException se)
                {
                    logger.LogError("Could not create SpecializationGroup. SpecializationGroup:{@SpecializationGroup} Code:{Code} Error:{Error}", g, se.ErrorCode, se.Message);
                    se.MapThrow();
                    throw;
                }
            }
        }

        public async Task<SpecializationGroupDeleteResult> Delete(int id)
        {
            logger.LogInformation("Deleting SpecializationGroup. Id:{Id}", id);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                try
                {
                    var deps = await cn.QueryAsync<ConceptDependent>(
                        Sql.Delete,
                        new { id, user = user.UUID },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout);

                    return new SpecializationGroupDeleteResult { ConceptDependents = deps };
                }
                catch (SqlException se)
                {
                    logger.LogError("Could not delete SpecializationGroup. Id:{Id} Code:{Code} Error:{Error}", id, se.ErrorCode, se.Message);
                    se.MapThrow();
                    throw;
                }
            }
        }

        public async Task<IEnumerable<SpecializationGroup>> Get()
        {
            logger.LogInformation("Getting SpecializationGroups.");
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    Sql.Get,
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return HydratedSpecializationGroupReader.Read(grid);
            }
        }

        public async Task<SpecializationGroup> Update(SpecializationGroup spec)
        {
            var record = new SpecializationGroupRecord(spec);
            logger.LogInformation("Updating SpecializationGroup:{SpecializationGroup}", record);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                try
                {
                    var updatedRecord = await cn.QueryFirstOrDefaultAsync<SpecializationGroupRecord>(
                        Sql.Update,
                        new { id = record.Id, sqlSetId = record.SqlSetId, uiDefaultText = record.UiDefaultText, user = user.UUID },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout
                    );

                    if (updatedRecord == null)
                    {
                        return null;
                    }

                    var updated = updatedRecord.SpecializationGroup();
                    updated.Specializations = spec.Specializations;
                    return updated;
                }
                catch (SqlException se)
                {
                    logger.LogInformation("Could not update SpecializationGroup. SpecializationGroup:{@SpecializationGroup} Code:{Code} Error:{Error}", record, se.ErrorCode, se.Message);
                    se.MapThrow();
                    throw;
                }
            }
        }

        static class Sql
        {
            public const string Create = "adm.sp_CreateSpecializationGroup";
            public const string Get = "adm.sp_GetSpecializationGroups";
            public const string Update = "adm.sp_UpdateSpecializationGroup";
            public const string Delete = "adm.sp_DeleteSpecializationGroup";
        }
    }

    public static class HydratedSpecializationGroupReader
    {
        public static SpecializationGroup ReadSingle(SqlMapper.GridReader grid)
        {
            var group = grid.ReadFirstOrDefault<SpecializationGroup>();
            if (group == null)
            {
                return null;
            }
            var specs = grid.Read<SpecializationRecord>();
            group.Specializations = specs.Select(s => s.Specialization());
            return group;
        }

        public static IEnumerable<SpecializationGroup> Read(SqlMapper.GridReader grid)
        {
            var groups = grid.Read<SpecializationGroupRecord>().ToDictionary(sg => sg.Id);
            var specs = grid.Read<SpecializationRecord>();

            if (groups.Any() && specs.Any())
            {
                foreach (var s in specs)
                {
                    if (groups.TryGetValue(s.SpecializationGroupId, out var group))
                    {
                        group.Specializations.Add(s);
                    }
                }
            }

            return groups.Values.Select(g => g.SpecializationGroup());
        }
    }

    class SpecializationGroupRecord
    {
        public int Id { get; set; }
        public int SqlSetId { get; set; }
        public List<SpecializationRecord> Specializations { get; set; } = new List<SpecializationRecord>();
        public string UiDefaultText { get; set; }

        public SpecializationGroup SpecializationGroup()
        {
            return new SpecializationGroup
            {
                Id = Id,
                SqlSetId = SqlSetId,
                UiDefaultText = UiDefaultText,
                Specializations = Specializations.Select(s => s.Specialization())
            };
        }

        public SpecializationGroupRecord()
        {

        }

        public SpecializationGroupRecord(SpecializationGroup g)
        {
            Id = g.Id;
            SqlSetId = g.SqlSetId;
            UiDefaultText = g.UiDefaultText;
        }
    }
}
