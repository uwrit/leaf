// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Admin.Compiler;

namespace API.DTO.Admin.Compiler
{
    public class DatasetQueryDeleteResponse
    {
        public int VisualizationComponentCount { get; set; }
        public IEnumerable<VisualizationComponentDependant> VisualizationComponents { get; set; }


        public static DatasetQueryDeleteResponse From(DatasetQueryDeleteResult result)
        {
            return new DatasetQueryDeleteResponse
            {
                VisualizationComponentCount = result.VisualizationComponentDependents?.Count() ?? 0,
                VisualizationComponents = result.VisualizationComponentDependents?.Take(10),
            };
        }
    }
}
