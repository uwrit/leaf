﻿// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Model.Compiler;
using Model.Tagging;

namespace Services.Search
{
    /// <summary>
    /// Represents a row in the app.Concept table.
    /// </summary>
    class ConceptRecord
    {
        public Guid Id { get; set; }
        public Guid? ParentId { get; set; }
        public Guid RootId { get; set; }
        public string ExternalId { get; set; }
        public string ExternalParentId { get; set; }
        public string UniversalId { get; set; }
        public bool IsNumeric { get; set; }
        public bool IsEventBased { get; set; }
        public bool IsParent { get; set; }
        public bool IsEncounterBased { get; set; }
        public bool IsPatientCountAutoCalculated { get; set; }
        public bool IsSpecializable { get; set; }
        public string SqlSetFrom { get; set; }
        public string SqlSetWhere { get; set; }
        public string SqlFieldDate { get; set; }
        public string SqlFieldNumeric { get; set; }
        public string SqlFieldEvent { get; set; }
        public string UiDisplayName { get; set; }
        public string UiDisplayText { get; set; }
        public string UiDisplaySubtext { get; set; }
        public string UiDisplayUnits { get; set; }
        public string UiDisplayTooltip { get; set; }
        public string UiDisplayEventName { get; set; }
        public int? UiDisplayPatientCount { get; set; }
        public int? EventTypeId { get; set; }
        public string UiDisplayPatientCountByYear { get; set; }
        public string UiNumericDefaultText { get; set; }
        

        public ConceptRecord() { }

        public ConceptRecord(Concept c)
        {
            Id = c.Id;
            ParentId = c.ParentId;
            RootId = c.RootId;
            ExternalId = c.ExternalId;
            ExternalParentId = c.ExternalParentId;
            UniversalId = c.UniversalId?.ToString();
            IsNumeric = c.IsNumeric;
            IsEventBased = c.IsEventBased;
            IsParent = c.IsParent;
            IsEncounterBased = c.IsEncounterBased;
            IsPatientCountAutoCalculated = c.IsPatientCountAutoCalculated;
            IsSpecializable = c.IsSpecializable;
            SqlSetFrom = c.SqlSetFrom;
            SqlSetWhere = c.SqlSetWhere;
            SqlFieldDate = c.SqlFieldDate;
            SqlFieldNumeric = c.SqlFieldNumeric;
            SqlFieldEvent = c.SqlFieldEvent;
            UiDisplayName = c.UiDisplayName;
            UiDisplayText = c.UiDisplayText;
            UiDisplaySubtext = c.UiDisplaySubtext;
            UiDisplayUnits = c.UiDisplayUnits;
            UiDisplayTooltip = c.UiDisplayTooltip;
            UiDisplayEventName = c.UiDisplayEventName;
            UiDisplayPatientCount = c.UiDisplayPatientCount;
            UiDisplayPatientCountByYear = ConceptPatientYearCountSerde.Serialize(c.UiDisplayPatientCountByYear);
            UiNumericDefaultText = c.UiNumericDefaultText;
            EventTypeId = c.EventTypeId;
        }

        public Concept Concept(ICollection<ConceptSpecializationGroup> groups)
        {
            var concept = Concept();
            concept.SpecializationGroups = groups.ToList();
            return concept;
        }

        public Concept Concept()
        {
            return new Concept
            {
                Id = Id,
                ParentId = ParentId,
                RootId = RootId,
                ExternalId = ExternalId,
                ExternalParentId = ExternalParentId,
                UniversalId = ConceptUrn.From(UniversalId),
                IsNumeric = IsNumeric,
                IsEventBased = IsEventBased,
                IsParent = IsParent,
                IsEncounterBased = IsEncounterBased,
                IsPatientCountAutoCalculated = IsPatientCountAutoCalculated,
                IsSpecializable = IsSpecializable,
                SqlSetFrom = SqlSetFrom,
                SqlSetWhere = SqlSetWhere,
                SqlFieldDate = SqlFieldDate,
                SqlFieldNumeric = SqlFieldNumeric,
                SqlFieldEvent = SqlFieldEvent,
                UiDisplayName = UiDisplayName,
                UiDisplayText = UiDisplayText,
                UiDisplaySubtext = UiDisplaySubtext,
                UiDisplayUnits = UiDisplayUnits,
                UiDisplayTooltip = UiDisplayTooltip,
                UiDisplayPatientCount = UiDisplayPatientCount,
                UiDisplayEventName = UiDisplayEventName,
                UiDisplayPatientCountByYear = ConceptPatientYearCountSerde.Deserialize(UiDisplayPatientCountByYear),
                UiNumericDefaultText = UiNumericDefaultText,
                EventTypeId = EventTypeId
            };
        }
    }
}
