// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Tagging;
using System.Collections.Generic;

namespace Model.Admin.Compiler
{
    public class Specialization
    {
        public Guid Id { get; set; }
        public int SpecializationGroupId { get; set; }
        public SpecializationUrn UniversalId { get; set; }
        public string UiDisplayText { get; set; }
        public string SqlSetWhere { get; set; }
        public int? OrderId { get; set; }
    }

    public class SpecializationGroup
    {
        public int Id { get; set; }
        public int SqlSetId { get; set; }
        public IEnumerable<Specialization> Specializations { get; set; } = new List<Specialization>();
        public string UiDefaultText { get; set; }
    }
}
