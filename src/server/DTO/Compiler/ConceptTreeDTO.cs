// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Model.Compiler;
using System.Collections.Generic;

namespace DTO.Compiler
{
    public class ConceptTreeDTO
    {
        public IEnumerable<PanelFilterDTO> PanelFilters { get; set; }
        public IEnumerable<ConceptDTO> Concepts { get; set; }

        public ConceptTreeDTO()
        {

        }

        public ConceptTreeDTO(ConceptTree tree)
        {
            PanelFilters = tree.PanelFilters.Select(f => new PanelFilterDTO(f));
            Concepts = tree.Concepts.Select(c => new ConceptDTO(c));
        }
    }
}
