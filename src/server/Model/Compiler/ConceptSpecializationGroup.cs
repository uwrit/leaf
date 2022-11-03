// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Compiler
{
    public class ConceptSpecializationGroup
    {
        public int Id { get; set; }
        public IEnumerable<ConceptSpecialization> Specializations { get; set; }
        public string UiDefaultText { get; set; }
        public int OrderId { get; set; }
    }

    public class ConceptSpecializationGroupContext : ConceptSpecializationGroup
    {
        public Guid ConceptId { get; set; }

        public ConceptSpecializationGroup Into(IEnumerable<ConceptSpecializationRecord> specializations)
        {
            return new ConceptSpecializationGroup
            {
                Id = Id,
                Specializations = specializations.Select(s => s.ToConceptSpecialization()).ToList(),
                UiDefaultText = UiDefaultText,
                OrderId = OrderId
            };
        }
    }
}
