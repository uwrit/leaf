// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Model.Admin;
using Model.Admin.Compiler;

namespace API.DTO.Admin.Compiler
{
    public class DatasetQueryCategoryDeleteResponse
    {
        public int DatasetQueryCount { get; set; }
        public IEnumerable<DatasetQueryDependent> DatasetQueries { get; set; }

        public DatasetQueryCategoryDeleteResponse(DatasetQueryCategoryDeleteResult r)
        {
            DatasetQueryCount = r.DatasetQueryDependents?.Count() ?? 0;
            DatasetQueries = r.DatasetQueryDependents?.Take(10);
        }
    }
}
