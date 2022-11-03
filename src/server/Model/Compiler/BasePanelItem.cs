// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Compiler
{
    public interface IBasePanelItem
    {
        NumericFilter NumericFilter { get; set; }
        RecencyFilterType RecencyFilter { get; set; }
        int Index { get; set; }
        int SubPanelIndex { get; set; }
        int PanelIndex { get; set; }
    }

    public abstract class BasePanelItem
    {
        public NumericFilter NumericFilter { get; set; }
        public RecencyFilterType RecencyFilter { get; set; }
        public int Index { get; set; }
        public int SubPanelIndex { get; set; }
        public int PanelIndex { get; set; }
    }

    public interface IPanelItemDTO : IBasePanelItem
    {
        string Id { get; }
        ResourceRef Resource { get; set; }
        IEnumerable<IConceptSpecializationDTO> Specializations { get; }
    }

    public static class IPanelItemDTOExtensions
    {
        public static PanelItem PanelItem(this IPanelItemDTO dto, Concept concept)
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
                                   select s).ToList() : null

            };
        }
    }
}
