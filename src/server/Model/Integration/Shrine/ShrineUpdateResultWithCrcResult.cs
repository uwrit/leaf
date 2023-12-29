﻿// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace Model.Integration.Shrine
{
	public class ShrineUpdateResultWithCrcResult : ShrineUpdateResultWithProgress
	{
        public ShrineBreakdown Breakdowns { get; set; }
        public ShrineResultObfuscatingParameters ObfuscatingParameters { get; set; }
        public int Count { get; set; }
    }

    public class ShrineBreakdown
    {
        public object[] Counts { get; set; }
    }
}

