// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace DTO.Compiler
{
    public class QuerySaveDTO : QueryDefinitionDTO, IQueryDefinition
    {
        public string UniversalId { get; set; }
        public int? Ver { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }

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
