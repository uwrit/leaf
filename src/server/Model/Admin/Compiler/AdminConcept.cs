﻿// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Tagging;
using System.Collections.Generic;
using Model.Compiler;

namespace Model.Admin.Compiler
{
    public class AdminConcept : IConstrainedResource
    {
        public Guid Id { get; set; }
        public ConceptUrn UniversalId { get; set; }
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
    }

    public class SpecializationGroupRelationship
    {
        public int SpecializationGroupId { get; set; }
        public int? OrderId { get; set; }
    }
}
