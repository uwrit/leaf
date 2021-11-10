﻿// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;

namespace Model.Export
{
    // TODO(ndobb) figure out better way to maintain project styling while accomplishing snake case in json for redcap
    public class REDCapProjectRequest
    {
        public string Project_title { get; set; }
        public string Purpose { get; set; }
        public string Is_longitudinal { get; set; }
        public string Record_autonumbering_enabled { get; set; }
    }
}
