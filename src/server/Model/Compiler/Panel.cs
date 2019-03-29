// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

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
}
