// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Compiler;

namespace API.DTO.Compiler
{
    public class PanelItemDTO : BasePanelItem, IPanelItemDTO
    {
        public string Id { get; set; }
        public ResourceRef Resource { get; set; }
        public IEnumerable<ConceptSpecializationDTO> Specializations { get; set; }
        IEnumerable<IConceptSpecializationDTO> IPanelItemDTO.Specializations => Specializations;
    }
}
