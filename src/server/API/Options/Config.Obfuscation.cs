// Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
            public const string MinimumCount = @"Obfuscation:ShiftValue";
        }
    }
}
