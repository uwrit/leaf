// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Tagging;

namespace Model.Compiler
{
    public class ConceptSpecialization : BaseConceptSpecialization
    {
        public string SqlSetWhere { get; set; }
    }

    public class BaseConceptSpecialization
    {
        public Guid Id { get; set; }
        public SpecializationUrn UniversalId { get; set; }
        public int SpecializationGroupId { get; set; }
        public string UiDisplayText { get; set; }
        public int OrderId { get; set; }

        public BaseConceptSpecialization()
        {

        }

        public BaseConceptSpecialization(ConceptSpecialization cs)
        {
            Id = cs.Id;
            UniversalId = cs.UniversalId;
            SpecializationGroupId = cs.SpecializationGroupId;
            UiDisplayText = cs.UiDisplayText;
            OrderId = cs.OrderId;
        }
    }
}
