﻿// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System.Collections.Generic;

namespace Model.Cohort
{
    public class NihRaceEthnicityBuckets
    {
        public Dictionary<string, NihRaceEthnicityBucket> EthnicBackgrounds = new Dictionary<string, NihRaceEthnicityBucket>();
        public int Total { get; set; }
    }

    public class NihRaceEthnicityBucket
    {
        public AgeByGenderBucket Hispanic = new AgeByGenderBucket();
        public AgeByGenderBucket NotHispanic = new AgeByGenderBucket();
        public AgeByGenderBucket Unknown = new AgeByGenderBucket();
        public int Total { get; set; }
    }
}
