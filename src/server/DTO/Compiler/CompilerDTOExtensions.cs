// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Compiler;

namespace DTO.Compiler
{
    public static class CompilerDTOExtensions
    {
        public static PanelItem ToModel(this PanelItemDTO dto, Concept concept)
        {
            return new PanelItem
            {
                Concept = concept,
                NumericFilter = dto.NumericFilter,
                RecencyFilter = dto.RecencyFilter,
                Index = dto.Index,
                SubPanelIndex = dto.SubPanelIndex,
                PanelIndex = dto.PanelIndex,
                Specializations = concept.SpecializationGroups != null && dto.Specializations != null ?
                                  (from g in concept.SpecializationGroups
                                   from s in g.Specializations
                                   from d in dto.Specializations
                                   where s.Id == d.Id || d.UniversalId != null && s.UniversalId.ToString() == d.UniversalId
                                   select s) : null

            };
        }

        public static SubPanel ToModel(this SubPanelDTO dto, IEnumerable<PanelItem> items)
        {
            return new SubPanel
            {
                PanelItems = items,
                PanelIndex = dto.PanelIndex,
                Index = dto.Index,
                IncludeSubPanel = dto.IncludeSubPanel,
                JoinSequence = dto.JoinSequence,
                MinimumCount = dto.MinimumCount,
                DateFilter = dto.DateFilter
            };
        }

        public static Panel ToModel(this PanelDTO dto, ICollection<SubPanel> subs)
        {
            return new Panel
            {
                SubPanels = subs,
                DateFilter = dto.DateFilter,
                IncludePanel = dto.IncludePanel,
                Domain = dto.Domain,
                Index = dto.Index
            };
        }

        public static IEnumerable<ConceptSpecializationGroupDTO> ToTransfer(this IEnumerable<ConceptSpecializationGroup> groups)
        {
            return groups?.Select(g => new ConceptSpecializationGroupDTO(g));
        }
    }
}
