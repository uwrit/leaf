// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Admin.Compiler
{
    public class DatasetQueryCategory
    {
        public int Id { get; set; }
        public string Category { get; set; }
        public DateTime Created { get; set; }
        public string CreatedBy { get; set; }
        public DateTime Updated { get; set; }
        public string UpdatedBy { get; set; }
    }

    public class DatasetQueryCategoryDeleteResult
    {
        public bool Ok
        {
            get
            {
                return !DatasetQueryDependents?.Any() ?? true;
            }
        }
        public IEnumerable<DatasetQueryDependent> DatasetQueryDependents { get; set; }
    }

    public class DatasetQueryDependent
    {
        public Guid Id { get; set; }
    }
}
