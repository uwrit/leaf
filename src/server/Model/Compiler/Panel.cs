// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Compiler
{
    public class Panel : BasePanel
    {
        public ICollection<SubPanel> SubPanels { get; set; }
        public PanelType PanelType
        {
            get
            {
                return SubPanels.Count > 1
                    ? PanelType.Sequence
                    : PanelType.Patient;
            }
        }
        public bool IsDateFiltered
        {
            get
            {
                var startType = DateFilter?.Start?.DateIncrementType;
                var end = DateFilter?.End;

                return startType != null && end != null
                    && startType != DateIncrementType.None;
            }
        }

        public Panel()
        {
            SubPanels = new List<SubPanel>();
        }
    }

    public static class PanelDomain
    {
        public static string Panel = "Panel";
        public static string PanelFilter = "PanelFilter";
        public static string GlobalPanelFilter = "GlobalPanelFilter";
    }
}
