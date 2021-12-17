// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;

namespace API.DTO.Compiler
{
    public class PanelFilterDTO : IPanelFilterDTO
    {
        public int Id { get; set; }
        public ConceptRefDTO Concept { get; set; }
        public bool IsInclusion { get; set; }
        public string UiDisplayText { get; set; }
        public string UiDisplayDescription { get; set; }
        IConceptRefDTO IPanelFilterDTO.Concept { get => Concept; set => Concept = value as ConceptRefDTO; }

        public PanelFilterDTO()
        {

        }

        public PanelFilterDTO(PanelFilter filter)
        {
            Id = filter.Id;
            Concept = new ConceptRefDTO(filter.Concept);
            IsInclusion = filter.IsInclusion;
            UiDisplayText = filter.UiDisplayText;
            UiDisplayDescription = filter.UiDisplayDescription;
        }
    }
}
