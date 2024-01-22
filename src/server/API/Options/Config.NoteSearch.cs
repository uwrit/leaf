// Copyright (c) 2024, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace API.Options
{
    public static partial class Config
    {
        public static class NoteSearch
        {
            public const string Section = @"NoteSearch";
            public const string Enabled = @"NoteSearch:Enabled";
            public const string IdentifiedModeOnly = @"NoteSearch:IdentifiedModeOnly";
        }
    }
}

