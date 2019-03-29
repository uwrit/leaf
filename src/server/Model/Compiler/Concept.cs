// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Tagging;
using Model.Extensions;

namespace Model.Compiler
{
    public class Concept : BaseConcept
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
        public string SqlSetFrom { get; set; }
        public string SqlSetWhere { get; set; }
        public string SqlFieldDate { get; set; }
        public string SqlFieldNumeric { get; set; }
        public string SqlFieldEventId { get; set; }
        public string UiDisplayName { get; set; }
        public string UiDisplayText { get; set; }
        public string UiDisplaySubtext { get; set; }
        public string UiDisplayUnits { get; set; }
        public string UiDisplayTooltip { get; set; }
        public int? UiDisplayPatientCount { get; set; }
        public IEnumerable<ConceptSpecializationGroup> SpecializationGroups { get; set; }
        public IEnumerable<ConceptPatientYearCount> UiDisplayPatientCountByYear { get; set; }
        public string UiNumericDefaultText { get; set; }
    }

    public class BaseConcept
    {
        public Guid Id { get; set; }
        public Urn UniversalId { get; set; }

        public BaseConcept()
        {

        }

        public BaseConcept(Concept c)
        {
            Id = c.Id;
            UniversalId = c.UniversalId;
        }
    }

    public class ConceptRef
    {
        public Guid? Id { get; set; }
        public Urn UniversalId { get; set; }

        public bool UseUniversalId()
        {
            return UniversalId != null;
        }

        public ConceptRef()
        {

        }

        public ConceptRef(string identifier)
        {
            if (Guid.TryParse(identifier, out var guid))
            {
                Id = guid;
            }
            else if (ConceptUrn.TryParse(identifier, out var urn))
            {
                UniversalId = urn;
            }
            else
            {
                throw new FormatException($"Concept identifier {identifier} is not a valid Guid or Urn");
            }
        }

        public ConceptRef(Concept c)
        {
            Id = c.Id;
            UniversalId = c.UniversalId;
        }
    }

    public class ConceptRefEqualityComparer : IEqualityComparer<ConceptRef>
    {
        public bool Equals(ConceptRef x, ConceptRef y)
        {
            if (x == null && y == null) return true;
            if (x == null || y == null) return false;
            return GetHashCode(x) == GetHashCode(y);
        }

        public int GetHashCode(ConceptRef @ref)
        {
            if (@ref.UseUniversalId())
            {
                return @ref.UniversalId.ToString().GetConsistentHashCode();
            }
            return @ref.Id.Value.GetHashCode();
        }
    }
}