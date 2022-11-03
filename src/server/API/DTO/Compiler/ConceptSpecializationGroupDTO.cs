﻿// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Linq;
using Model.Compiler;
using System.Collections.Generic;

namespace API.DTO.Compiler
{
    public class ConceptSpecializationGroupDTO : ConceptSpecializationGroup
    {
        public new IEnumerable<ConceptSpecializationDTO> Specializations { get; set; }

        public ConceptSpecializationGroupDTO()
        {

        }

        public ConceptSpecializationGroupDTO(ConceptSpecializationGroup group)
        {
            Specializations = group.Specializations.Select(s => new ConceptSpecializationDTO(s));
            Id = group.Id;
            OrderId = group.OrderId;
            UiDefaultText = group.UiDefaultText;
        }
    }
}
