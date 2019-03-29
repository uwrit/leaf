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
using Services.Tables;
using Services.Compiler;
using System.Linq;

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

        static class Sql
        {
            public const string Get = "adm.sp_GetConceptById";
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
