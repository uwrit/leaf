﻿// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;

namespace Model.Admin.Compiler
{
    public class SpecializationGroupDeleteResult
    {
        public bool Ok => !ConceptDependents?.Any() ?? true;
        public IEnumerable<ConceptDependent> ConceptDependents { get; set; }
    }

    public class SpecializationGroupDependent
    {
        public int Id { get; set; }
        public string UiDefaultText { get; set; }
    }
}
