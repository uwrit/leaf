// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Compiler;

namespace DTO.Compiler
{
    public class ConceptDTO : ConceptRefDTO
    {
        public Guid? ParentId { get; set; }
        public Guid RootId { get; set; }
        public string ExternalId { get; set; }
        public string ExternalParentId { get; set; }
        public bool IsNumeric { get; set; }
        public bool IsEventBased { get; set; }
        public bool IsParent { get; set; }
        public bool IsEncounterBased { get; set; }
        public bool IsPatientCountAutoCalculated { get; set; }
        public bool IsSpecializable { get; set; }
        public string UiDisplayName { get; set; }
        public string UiDisplayText { get; set; }
        public string UiDisplaySubtext { get; set; }
        public string UiDisplayUnits { get; set; }
        public string UiDisplayTooltip { get; set; }
        public int? UiDisplayPatientCount { get; set; }
        public IEnumerable<ConceptSpecializationGroup> SpecializationGroups { get; set; }
        public IEnumerable<ConceptPatientYearCount> UiDisplayPatientCountByYear { get; set; }
        public string UiNumericDefaultText { get; set; }

        public ConceptDTO() { }

        public ConceptDTO(Concept c) : base(c)
        {
            ParentId = c.ParentId;
            RootId = c.RootId;
            ExternalId = c.ExternalId;
            ExternalParentId = c.ExternalParentId;
            IsNumeric = c.IsNumeric;
            IsEventBased = c.IsEventBased;
            IsParent = c.IsParent;
            IsEncounterBased = c.IsEncounterBased;
            IsSpecializable = c.IsSpecializable;
            SpecializationGroups = c.SpecializationGroups.ToTransfer();
            UiDisplayName = c.UiDisplayName;
            UiDisplayText = c.UiDisplayText;
            UiDisplaySubtext = c.UiDisplaySubtext;
            UiDisplayUnits = c.UiDisplayUnits;
            UiDisplayTooltip = c.UiDisplayTooltip;
            UiDisplayPatientCount = c.UiDisplayPatientCount;
            UiDisplayPatientCountByYear = c.UiDisplayPatientCountByYear;
            UiNumericDefaultText = c.UiNumericDefaultText;
        }
    }

    public class ConceptRefDTO
    {
        public Guid? Id { get; set; }
        public string UniversalId { get; set; }

        public bool UseUniversalId => !string.IsNullOrWhiteSpace(UniversalId);

        public ConceptRefDTO()
        {

        }

        public ConceptRefDTO(ConceptRef c)
        {
            Id = c.Id;
            UniversalId = c.UniversalId?.ToString();
        }

        public ConceptRefDTO(Concept c)
        {
            Id = c.Id;
            UniversalId = c.UniversalId?.ToString();
        }
    }
}
