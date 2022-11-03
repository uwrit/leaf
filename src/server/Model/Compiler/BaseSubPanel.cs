// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Compiler
{
    public interface IBaseSubPanel
    {
        int PanelIndex { get; set; }
        int Index { get; set; }
        bool IncludeSubPanel { get; set; }
        int MinimumCount { get; set; }
        SubPanelJoinSequence JoinSequence { get; set; }
        DateFilter DateFilter { get; set; }
    }

    public abstract class BaseSubPanel : IBaseSubPanel
    {
        public int PanelIndex { get; set; }
        public int Index { get; set; }
        public bool IncludeSubPanel { get; set; }
        public int MinimumCount { get; set; }
        public SubPanelJoinSequence JoinSequence { get; set; }
        public DateFilter DateFilter { get; set; }
    }

    public interface ISubPanelDTO : IBaseSubPanel
    {
        string Id { get; }
        IEnumerable<IPanelItemDTO> PanelItems { get; }
    }

    public static class ISubPanelDTOExtensions
    {
        public static SubPanel SubPanel(this ISubPanelDTO dto, IEnumerable<PanelItem> items)
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
    }
}
