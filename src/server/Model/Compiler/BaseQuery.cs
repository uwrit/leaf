// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Tagging;

namespace Model.Compiler
{
    public class BaseQuery
    {
        public Guid Id { get; set; }
        public QueryUrn UniversalId { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string Owner { get; set; }
        public DateTime Created { get; set; }
        public DateTime Updated { get; set; }
        public int? Count { get; set; }
    }
}
