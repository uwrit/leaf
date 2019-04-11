// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using Model.Tagging;

namespace Model.Compiler
{
    public class ConceptSpecializationRecord
    {
        public Guid Id { get; set; }
        public string UniversalId { get; set; }
        public string SqlSetWhere { get; set; }
        public string UiDisplayText { get; set; }
        public int SpecializationGroupId { get; set; }
        public int OrderId { get; set; }

        public ConceptSpecialization ToConceptSpecialization()
        {
            return new ConceptSpecialization
            {
                Id = Id,
                UniversalId = SpecializationUrn.From(UniversalId),
                SqlSetWhere = SqlSetWhere,
                UiDisplayText = UiDisplayText,
                SpecializationGroupId = SpecializationGroupId,
                OrderId = OrderId
            };
        }
    }
}
