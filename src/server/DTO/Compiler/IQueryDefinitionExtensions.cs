// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using System.Collections.Generic;
using System.Linq;

namespace DTO.Compiler
{
    public static class IQueryDefinitionExtensions
    {
        public static IEnumerable<IPanelDTO> MergeAll(this IQueryDefinition query)
        {
            var lastPanelIndex = query.Panels.Max(p => p.Index);
            var merge = new List<IPanelDTO>();
            merge.AddRange(query.Panels);

            for (int i = 0; i < query.PanelFilters.Count(); i++)
            {
                var filter = query.PanelFilters.ElementAt(i);
                var panelIndex = lastPanelIndex + i + 1;
                var dto = PanelDTO.FromPanelFilterDTO(filter, panelIndex);
                merge.Add(dto);
            }
            return merge;
        }
    }
}
