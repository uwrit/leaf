// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Options
{
    public class ObfuscationOptions
    {
        public bool Enabled { get; set; }
        public NoiseOptions Noise = new NoiseOptions();
        public LowCellSizeMaskingOptions LowCellSizeMasking = new LowCellSizeMaskingOptions();
        public RowLevelDataOptions RowLevelData = new RowLevelDataOptions();

        public bool ShouldObfuscate() => Enabled;

        public class NoiseOptions
        {
            public bool Enabled { get; set; }
            public int LowerBound { get; set; }
            public int UpperBound { get; set; }
        }

        public class LowCellSizeMaskingOptions
        {
            public bool Enabled { get; set; }
            public int Threshold { get; set; }
        }

        public class RowLevelDataOptions
        {
            public bool Enabled { get; set; }
        }
    }
}
