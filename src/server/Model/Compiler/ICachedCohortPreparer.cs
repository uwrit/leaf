﻿// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Model.Compiler
{
    public interface ICachedCohortPreparer
    {
        string FieldInternalPersonId { get; set; }
        string FieldPersonId { get; set; }
        string FieldExported { get; set; }
        string FieldSalt { get; set; }
        string FieldQueryId { get; set; }
        string TempTableName { get; set; }
        Task<string> Prepare(Guid queryId, bool exportedOnly);
        Task<string> Prepare(IEnumerable<Guid> queryId, bool exportedOnly);
        string Complete();
        string CohortToCte();
        string CohortToCteFrom();
        string CohortToCteWhere();
    }
}
