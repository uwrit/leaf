// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Compiler
{
    [Flags]
    public enum CompilerContextState
    {
        Ok = 0,
        QueryNotFound = 1,
        DatasetNotFound = 2,
        ConceptNotFound = 3,
        PanelNotFound = 4,
        DatasetShapeMismatch = 5,
    }
}
