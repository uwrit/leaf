// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;

namespace Services.Compiler
{
    class PanelItemContext
    {
        public PanelItem PanelItem { get; set; }
        public bool SubPanelHasNonEncounter { get; set; }
        public string TargetColumn { get; set; }
        public bool FilterDate { get; set; }
        public bool FilterCount { get; set; }
        public int MinCount { get; set; }
        public DateFilter DateStart { get; set; }
        public DateFilter DateStop { get; set; }
        public bool IsSequential { get; set; }
        public bool IsExists { get; set; }
        public string ExistsParentAlias { get; set; }
        public string ExistsJoinColumn { get; set; }
    }
}
