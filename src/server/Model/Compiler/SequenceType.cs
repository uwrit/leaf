// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace Model.Compiler
{
    public enum SequenceType
    {
        Encounter = 0,
        PlusMinus = 1,
        WithinFollowing = 2,
        AnytimeFollowing = 3,
        Event = 4
    }
}
