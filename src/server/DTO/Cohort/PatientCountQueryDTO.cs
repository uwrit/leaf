// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using DTO.Compiler;
using System.Collections.Generic;
using Model.Compiler;
using System.Linq;

namespace DTO.Cohort
{
    public class PatientCountQueryDTO : IQueryDefinition
    {
        public string QueryId { get; set; }
        public IReadOnlyCollection<PanelDTO> Panels { get; set; }
        public IReadOnlyCollection<PanelFilterDTO> PanelFilters { get; set; }

        IReadOnlyCollection<PanelDTO> all;
        public IReadOnlyCollection<PanelDTO> All
        {
            get
            {
                if (all == null)
                {
                    all = this.MergeAll();
                }
                return all;
            }
        }
    }
}
