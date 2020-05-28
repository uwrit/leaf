// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace API.Options
{
    public static partial class Config
    {
        public static class Obfuscation
        {
            public const string Section = @"Obfuscation";
            public const string Enabled = @"Obfuscation:Enabled";

            public static class Noise
            {
                public const string Enabled = @"Obfuscation:Noise:Enabled";
                public const string LowerBound = @"Obfuscation:Noise:LowerBound";
                public const string UpperBound = @"Obfuscation:Noise:UpperBound";
            }

            public static class LowCellSizeMasking
            {
                public const string Enabled = @"Obfuscation:LowCellSizeMasking:Enabled";
                public const string Threshold = @"Obfuscation:LowCellSizeMasking:Threshold";
            }

            public static class RowLevelData
            {
                public const string Enabled = @"Obfuscation:RowLevelData:Enabled";
            }
        }
    }
}
