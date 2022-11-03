// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Compiler;

namespace API.DTO.Cohort
{
    public class ConceptDatasetPanelDTO : IConceptDatasetPanel
    {
        public IEnumerable<IPanelDTO> Panels { get; set; }
        public IEnumerable<IPanelFilterDTO> PanelFilters { get; set; }

        public ConceptDatasetPanelDTO(IPanelDTO panel)
        {
            Panels = new List<IPanelDTO> { panel };
            PanelFilters = new List<IPanelFilterDTO>();
        }

        public IEnumerable<IPanelDTO> All()
        {
            return Panels;
        }
    }
}