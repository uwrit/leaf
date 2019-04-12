// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using API.DTO.Compiler;
using System.Collections.Generic;
using Model.Compiler;
using System.Linq;

namespace API.DTO.Cohort
{
    public class PatientCountQueryDTO : IPatientCountQueryDTO
    {
        public string QueryId { get; set; }
        public IEnumerable<PanelDTO> Panels { get; set; }
        public IEnumerable<PanelFilterDTO> PanelFilters { get; set; }

        IEnumerable<IPanelDTO> all;
        IEnumerable<IPanelDTO> IQueryDefinition.All()
        {
            if (all == null)
            {
                all = this.MergeAll();
            }
            return all;
        }

        IEnumerable<IPanelDTO> IQueryDefinition.Panels
        {
            get => Panels;
            set => Panels = value as IEnumerable<PanelDTO>;
        }
        IEnumerable<IPanelFilterDTO> IQueryDefinition.PanelFilters
        {
            get => PanelFilters;
            set => PanelFilters = value as IEnumerable<PanelFilterDTO>;
        }
    }
}
