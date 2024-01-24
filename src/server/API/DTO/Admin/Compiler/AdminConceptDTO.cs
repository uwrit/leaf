// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Admin;
using Model.Compiler;
using System.Collections.Generic;
using Model.Tagging;
using Model.Admin.Compiler;

namespace API.DTO.Admin.Compiler
{
    public class AdminConceptDTO
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
        public bool? IsRoot { get; set; }
        public bool? IsPatientCountAutoCalculated { get; set; }
        public bool? IsSpecializable { get; set; }
        public string SqlSetWhere { get; set; }
        public string SqlFieldNumeric { get; set; }
        public Shape? FhirResourceShapeId { get; set; }
        public string FhirSearchParameters { get; set; }
        public string UiDisplayName { get; set; }
        public string UiDisplayText { get; set; }
        public string UiDisplaySubtext { get; set; }
        public string UiDisplayUnits { get; set; }
        public string UiDisplayTooltip { get; set; }
        public int? UiDisplayPatientCount { get; set; }
        public IEnumerable<ConceptPatientYearCount> UiDisplayPatientCountByYear { get; set; }
        public string UiNumericDefaultText { get; set; }

        public IEnumerable<Constraint> Constraints { get; set; }

        public IEnumerable<SpecializationGroupRelationship> SpecializationGroups { get; set; }

        public AdminConceptDTO()
        {

        }

        public AdminConceptDTO(AdminConcept c)
        {
            Id = c.Id;
            UniversalId = c.UniversalId?.ToString();
            ParentId = c.ParentId;
            RootId = c.RootId;
            ExternalId = c.ExternalId;
            ExternalParentId = c.ExternalParentId;
            SqlSetId = c.SqlSetId;
            IsNumeric = c.IsNumeric;
            IsParent = c.IsParent;
            IsRoot = c.IsRoot;
            IsPatientCountAutoCalculated = c.IsPatientCountAutoCalculated;
            IsSpecializable = c.IsSpecializable;
            SqlSetWhere = c.SqlSetWhere;
            SqlFieldNumeric = c.SqlFieldNumeric;
            FhirResourceShapeId = c.FhirResourceShapeId;
            FhirSearchParameters = c.FhirSearchParameters;
            UiDisplayName = c.UiDisplayName;
            UiDisplayText = c.UiDisplayText;
            UiDisplaySubtext = c.UiDisplaySubtext;
            UiDisplayUnits = c.UiDisplayUnits;
            UiDisplayTooltip = c.UiDisplayTooltip;
            UiDisplayPatientCount = c.UiDisplayPatientCount;
            UiDisplayPatientCountByYear = c.UiDisplayPatientCountByYear;
            UiNumericDefaultText = c.UiNumericDefaultText;
            Constraints = c.Constraints;
            SpecializationGroups = c.SpecializationGroups;
        }
    }

    public static class ConceptExtensions
    {
        public static AdminConcept Concept(this AdminConceptDTO dto)
        {
            if (dto == null) return null;
            return new AdminConcept
            {
                Id = dto.Id,
                UniversalId = ConceptUrn.From(dto.UniversalId),
                ParentId = dto.ParentId,
                RootId = dto.RootId,
                ExternalId = dto.ExternalId,
                ExternalParentId = dto.ExternalParentId,
                SqlSetId = dto.SqlSetId,
                IsNumeric = dto.IsNumeric,
                IsParent = dto.IsParent,
                IsRoot = dto.IsRoot,
                IsPatientCountAutoCalculated = dto.IsPatientCountAutoCalculated,
                IsSpecializable = dto.IsSpecializable,
                SqlSetWhere = dto.SqlSetWhere,
                SqlFieldNumeric = dto.SqlFieldNumeric,
                FhirResourceShapeId = dto.FhirResourceShapeId,
                FhirSearchParameters = dto.FhirSearchParameters,
                UiDisplayName = dto.UiDisplayName,
                UiDisplayText = dto.UiDisplayText,
                UiDisplaySubtext = dto.UiDisplaySubtext,
                UiDisplayUnits = dto.UiDisplayUnits,
                UiDisplayTooltip = dto.UiDisplayTooltip,
                UiDisplayPatientCount = dto.UiDisplayPatientCount,
                UiDisplayPatientCountByYear = dto.UiDisplayPatientCountByYear,
                UiNumericDefaultText = dto.UiNumericDefaultText,
                Constraints = dto.Constraints,
                SpecializationGroups = dto.SpecializationGroups,
            };
        }
    }
}
