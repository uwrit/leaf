// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Tagging;

namespace Model.Compiler
{
    public class PanelFilterRecord
    {
        // BaseConcept
        public Guid? ConceptId { get; set; }
        public string ConceptUniversalId { get; set; }

        public int Id { get; set; }
        public bool IsInclusion { get; set; }
        public string UiDisplayText { get; set; }
        public string UiDisplayDescription { get; set; }

        public PanelFilter ToPanelFilter()
        {
            return new PanelFilter
            {
                Id = Id,
                Concept = new ConceptRef { Id = ConceptId, UniversalId = ConceptUrn.From(ConceptUniversalId) },
                IsInclusion = IsInclusion,
                UiDisplayText = UiDisplayText,
                UiDisplayDescription = UiDisplayDescription
            };
        }
    }
}
