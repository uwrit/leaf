// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace API.Options
{
    public static partial class Config
    {
        public static class Logging
        {
            public const string Section = @"Logging";
            public const string Directory = @"SERILOG_DIR";
            public const string FileTemplate = @"leaf-api-{Date}.log";
        }
    }
}