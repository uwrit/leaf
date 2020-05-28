// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Compiler
{
    public class PanelItem : BasePanelItem
    {
        public Concept Concept { get; set; }
        public IEnumerable<ConceptSpecialization> Specializations { get; set; }
        public string SqlRecencyFilter { get; set; }
        public bool UseNumericFilter
        {
            get
            {
                return NumericFilter != null && NumericFilter.FilterType != NumericFilterType.None;
            }
        }
        public bool HasSpecializations
        {
            get
            {
                return Specializations != null && Specializations.Any();
            }
        }
        public bool UseRecencyFilter => RecencyFilter != RecencyFilterType.None;
    }
}
