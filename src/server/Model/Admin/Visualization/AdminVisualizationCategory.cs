// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;

namespace Model.Admin.Visualization
{
    public class AdminVisualizationCategory
    {
        public Guid Id { get; set; }
        public string Category { get; set; }

        public DateTime Created { get; set; }
        public string CreatedBy { get; set; }
        public DateTime Updated { get; set; }
        public string UpdatedBy { get; set; }
    }

    public class VisualizationCategoryDeleteResult
    {
        public bool Ok
        {
            get
            {
                return !VisualizationCategoryDependents?.Any() ?? true;
            }
        }
        public IEnumerable<VisualizationCategoryDependent> VisualizationCategoryDependents { get; set; }
    }

    public class VisualizationCategoryDependent
    {
        public Guid Id { get; set; }
    }
}

 