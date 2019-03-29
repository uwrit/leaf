// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;

// TODO(cspital) rename and generalize this

namespace Model.Cohort
{
    public class PatientListColumn
    {
        public int Key { get; set; }
        public bool Hidden { get; set; }
        public string Name { get; set; }
        public bool Sortable { get; set; }
        public bool Locked { get; set; }
    }
}
