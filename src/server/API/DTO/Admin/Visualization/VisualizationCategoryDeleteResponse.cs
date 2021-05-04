// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Model.Admin.Visualization;

namespace API.DTO.Admin.Visualization
{
    public class VisualizationCategoryDeleteResponse
    {
        public int VisualizationComponentCount { get; set; }
        public IEnumerable<VisualizationCategoryDependent> VisualizationComponents { get; set; }

        public VisualizationCategoryDeleteResponse(VisualizationCategoryDeleteResult r)
        {
            VisualizationComponentCount = r.VisualizationCategoryDependents?.Count() ?? 0;
            VisualizationComponents = r.VisualizationCategoryDependents?.Take(10);
        }
    }
}
