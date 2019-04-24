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
using Services.Tables;
using Services.Compiler;
using System.Linq;
using Model.Authorization;
using Services.Extensions;

namespace Services.Admin
{
    public class AdminConceptService : IAdminConceptService
    {
        readonly IUserContext user;
        readonly ILogger<AdminConceptService> logger;
        readonly AppDbOptions opts;

        public AdminConceptService(
            ILogger<AdminConceptService> logger,
            IOptions<AppDbOptions> options,
            IUserContext userContext)
        {
            this.logger = logger;
            opts = options.Value;
            user = userContext;
        }

        public async Task<Concept> Create(Concept c)
        {
            logger.LogInformation("Creating Concept. Concept:{@Concept}", c);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                try
                {
                    var grid = await cn.QueryMultipleAsync(
                        Sql.Create,
                        new
                        {
                            universalId = c.UniversalId?.ToString(),
                            parentId = c.ParentId,
                            rootId = c.RootId,
                            externalId = c.ExternalId,
                            externalParentId = c.ExternalParentId,
                            isPatientCountAutoCalculated = c.IsPatientCountAutoCalculated,
                            isNumeric = c.IsNumeric,
                            isParent = c.IsParent,
                            isRoot = c.IsRoot,
                            isSpecializable = c.IsSpecializable,
                            sqlSetId = c.SqlSetId,
                            sqlSetWhere = c.SqlSetWhere,
                            sqlFieldNumeric = c.SqlFieldNumeric,
                            uiDisplayName = c.UiDisplayName,
                            uiDisplayText = c.UiDisplayText,
                            uiDisplaySubtext = c.UiDisplaySubtext,
                            uiDisplayUnits = c.UiDisplayUnits,
                            uiDisplayTooltip = c.UiDisplayTooltip,
                            uiDisplayPatientCount = c.UiDisplayPatientCount,
                            uiNumericDefaultText = c.UiNumericDefaultText,
                            constraints = ConceptConstraintTable.From(c),
                            specializationGroups = ConceptSpecializationGroupTable.From(c),
                            user = user.UUID
                        },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout
                    );

                    return AdminConceptReader.Read(grid);
                }
                catch (SqlException se)
                {
                    logger.LogError("Could not create concept. Concept:{@Concept} Code:{Code} Error:{Error}", c, se.ErrorCode, se.Message);
                    se.MapThrow();
                    throw;
                }
            }
        }

        public async Task<ConceptDeleteResult> Delete(Guid id)
        {
            logger.LogInformation("Deleting Concept. Id:{Id}", id);
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

                    return AdminConceptDeleteReader.Read(grid);
                }
                catch (SqlException se)
                {
                    logger.LogError("Could not delete concept. Id:{Id} Code:{Code} Error:{Error}", id, se.ErrorCode, se.Message);
                    se.MapThrow();
                    throw;
                }
            }
        }

        public async Task<Concept> Get(Guid id)
        {
            logger.LogInformation("Getting Concept. Id:{Id}", id);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                var grid = await cn.QueryMultipleAsync(
                    Sql.Get,
                    new { id },
                    commandType: CommandType.StoredProcedure,
                    commandTimeout: opts.DefaultTimeout
                );

                return AdminConceptReader.Read(grid);
            }
        }

        public async Task<Concept> Update(Concept c)
        {
            logger.LogInformation("Updating Concept. Concept:{@Concept}", c);
            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                try
                {
                    var grid = await cn.QueryMultipleAsync(
                        Sql.Update,
                        new
                        {
                            id = c.Id,
                            universalId = c.UniversalId?.ToString(),
                            parentId = c.ParentId,
                            rootId = c.RootId,
                            externalId = c.ExternalId,
                            externalParentId = c.ExternalParentId,
                            isPatientCountAutoCalculated = c.IsPatientCountAutoCalculated,
                            isNumeric = c.IsNumeric,
                            isParent = c.IsParent,
                            isRoot = c.IsRoot,
                            isSpecializable = c.IsSpecializable,
                            sqlSetId = c.SqlSetId,
                            sqlSetWhere = c.SqlSetWhere,
                            sqlFieldNumeric = c.SqlFieldNumeric,
                            uiDisplayName = c.UiDisplayName,
                            uiDisplayText = c.UiDisplayText,
                            uiDisplaySubtext = c.UiDisplaySubtext,
                            uiDisplayUnits = c.UiDisplayUnits,
                            uiDisplayTooltip = c.UiDisplayTooltip,
                            uiDisplayPatientCount = c.UiDisplayPatientCount,
                            uiNumericDefaultText = c.UiNumericDefaultText,
                            constraints = ConceptConstraintTable.From(c),
                            specializationGroups = ConceptSpecializationGroupTable.From(c),
                            user = user.UUID
                        },
                        commandType: CommandType.StoredProcedure,
                        commandTimeout: opts.DefaultTimeout
                    );

                    return AdminConceptReader.Read(grid);
                }
                catch (SqlException se)
                {
                    logger.LogError("Could not update concept. Concept:{@Concept} Code:{Code} Error:{Error}", c, se.ErrorCode, se.Message);
                    se.MapThrow();
                    throw;
                }
            }
        }

        static class Sql
        {
            public const string Get = "adm.sp_GetConceptById";
            public const string Update = "adm.sp_UpdateConcept";
            public const string Create = "adm.sp_CreateConcept";
            public const string Delete = "adm.sp_DeleteConcept";
        }
    }

    static class AdminConceptReader
    {
        public static Concept Read(SqlMapper.GridReader grid)
        {
            var cr = grid.ReadFirstOrDefault<ConceptRecord>();
            if (cr == null)
            {
                return null;
            }
            var groups = grid.Read<SpecializationGroupRelationship>();
            var ccr = grid.Read<ConceptConstraintRecord>();
            return cr.Concept(groups, ccr);
        }
    }

    static class AdminConceptDeleteReader
    {
        public static ConceptDeleteResult Read(SqlMapper.GridReader grid)
        {
            var pf = grid.Read<PanelFilterDependent>();
            var q = grid.Read<QueryDependent>();
            var c = grid.Read<ConceptDependent>();

            return new ConceptDeleteResult
            {
                PanelFilterDependents = pf,
                QueryDependents = q,
                ConceptDependents = c
            };
        }
    }

    class ConceptRecord
    {
        public Guid Id { get; set; }
        public string UniversalId { get; set; }
        public Guid? ParentId { get; set; }
        public Guid? RootId { get; set; }
        public string ExternalId { get; set; }
        public string ExternalParentId { get; set; }
        public int? SqlSetId { get; set; }
        public bool? IsNumeric { get; set; }
        public bool? IsParent { get; set; }
        public bool? IsPatientCountAutoCalculated { get; set; }
        public bool? IsSpecializable { get; set; }
        public string SqlSetWhere { get; set; }
        public string SqlFieldNumeric { get; set; }
        public string UiDisplayName { get; set; }
        public string UiDisplayText { get; set; }
        public string UiDisplaySubtext { get; set; }
        public string UiDisplayUnits { get; set; }
        public string UiDisplayTooltip { get; set; }
        public int? UiDisplayPatientCount { get; set; }
        public string UiDisplayPatientCountByYear { get; set; }
        public string UiNumericDefaultText { get; set; }

        public Concept Concept(IEnumerable<SpecializationGroupRelationship> groups = null, IEnumerable<ConceptConstraintRecord> constraints = null)
        {
            return new Concept
            {
                Id = Id,
                UniversalId = ConceptUrn.From(UniversalId),
                ParentId = ParentId,
                RootId = RootId,
                ExternalId = ExternalId,
                ExternalParentId = ExternalParentId,
                SqlSetId = SqlSetId,
                IsNumeric = IsNumeric,
                IsParent = IsParent,
                IsPatientCountAutoCalculated = IsPatientCountAutoCalculated,
                IsSpecializable = IsSpecializable,
                SqlSetWhere = SqlSetWhere,
                SqlFieldNumeric = SqlFieldNumeric,
                UiDisplayName = UiDisplayName,
                UiDisplayText = UiDisplayText,
                UiDisplaySubtext = UiDisplaySubtext,
                UiDisplayUnits = UiDisplayUnits,
                UiDisplayTooltip = UiDisplayTooltip,
                UiDisplayPatientCount = UiDisplayPatientCount,
                UiDisplayPatientCountByYear = ConceptPatientYearCountSerde.Deserialize(UiDisplayPatientCountByYear),
                UiNumericDefaultText = UiNumericDefaultText,
                SpecializationGroups = groups ?? new List<SpecializationGroupRelationship>(),
                Constraints = constraints?.Select(c => c.Constraint()) ?? new List<ConceptConstraint>()
            };
        }
    }

    class ConceptConstraintRecord
    {
        public Guid ConceptId { get; set; }
        public int ConstraintId { get; set; }
        public string ConstraintValue { get; set; }

        public ConceptConstraint Constraint()
        {
            return new ConceptConstraint
            {
                ConceptId = ConceptId,
                ConstraintId = ConceptConstraint.TypeFrom(ConstraintId),
                ConstraintValue = ConstraintValue
            };
        }
    }
}
