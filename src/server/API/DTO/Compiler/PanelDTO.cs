// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using System.Collections.Generic;

namespace API.DTO.Compiler
{
    public class PanelDTO : BasePanel, IPanelDTO
    {
        public string Id { get; set; }
        public IEnumerable<SubPanelDTO> SubPanels { get; set; }

        IEnumerable<ISubPanelDTO> IPanelDTO.SubPanels => SubPanels;

        public static PanelDTO FromPanelFilterDTO(IPanelFilterDTO filter, int panelIndex)
        {
            return new PanelDTO
            {
                Index = panelIndex,
                IncludePanel = filter.IsInclusion,
                SubPanels = new List<SubPanelDTO>
                {
                    new SubPanelDTO
                    {
                        PanelIndex = panelIndex,
                        Index = 0,
                        IncludeSubPanel = true,
                        MinimumCount = 1,
                        PanelItems = new List<PanelItemDTO>
                        {
                            new PanelItemDTO
                            {
                                Resource = new ResourceRef
                                {
                                    Id = filter.Concept.Id,
                                    UniversalId = filter.Concept.UniversalId?.ToString()
                                }
                            }
                        }
                    }
                }
            };
        }
    }
}
