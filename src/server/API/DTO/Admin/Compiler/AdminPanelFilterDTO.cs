// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Admin.Compiler;

namespace API.DTO.Admin.Compiler
{
    public class PanelFilterDTO
    {
        public int Id { get; set; }
        public Guid ConceptId { get; set; }
        public string UiDisplayText { get; set; }
        public string UiDisplayDescription { get; set; }

        public PanelFilterDTO() { }

        public PanelFilterDTO(AdminPanelFilter panelFilter)
        {
            Id = panelFilter.Id;
            ConceptId = panelFilter.ConceptId;
            UiDisplayText = panelFilter.UiDisplayText;
            UiDisplayDescription = panelFilter.UiDisplayDescription;
        }
    }
}
