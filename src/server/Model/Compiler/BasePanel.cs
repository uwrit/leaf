// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Compiler
{
    public interface IBasePanel
    {
        DateBoundary DateFilter { get; set; }
        bool IncludePanel { get; set; }
        string Domain { get; set; }
        int Index { get; set; }
    }

    public abstract class BasePanel
    {
        public DateBoundary DateFilter { get; set; }
        public bool IncludePanel { get; set; }
        public string Domain { get; set; }
        public int Index { get; set; }
    }

    public interface IPanelDTO : IBasePanel
    {
        string Id { get; }
        IEnumerable<ISubPanelDTO> SubPanels { get; }
    }

    public static class IPanelDTOExtensions
    {
        public static Panel Panel(this IPanelDTO dto, ICollection<SubPanel> subs)
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
    }
}
