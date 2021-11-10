// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Compiler;

namespace API.DTO.Compiler
{
    public class SubPanelDTO : BaseSubPanel, ISubPanelDTO
    {
        public string Id { get; set; }
        public IEnumerable<PanelItemDTO> PanelItems { get; set; }
        IEnumerable<IPanelItemDTO> ISubPanelDTO.PanelItems => PanelItems;
    }
}
