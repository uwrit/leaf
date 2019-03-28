// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Admin;
using Model.Compiler;
using System.Collections.Generic;

namespace DTO.Admin
{
    public class ConceptDTO
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
        public IEnumerable<ConceptPatientYearCount> UiDisplayPatientCountByYear { get; set; }
        public string UiNumericDefaultText { get; set; }

        public IEnumerable<ConceptConstraint> Constraints { get; set; }

        public IEnumerable<SpecializationGroupRelationship> SpecializationGroups { get; set; }

        public ConceptDTO()
        {

        }

        public ConceptDTO(Model.Admin.Concept c)
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
            IsPatientCountAutoCalculated = c.IsPatientCountAutoCalculated;
            IsSpecializable = c.IsSpecializable;
            SqlSetWhere = c.SqlSetWhere;
            SqlFieldNumeric = c.SqlFieldNumeric;
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
}
