// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

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
}
