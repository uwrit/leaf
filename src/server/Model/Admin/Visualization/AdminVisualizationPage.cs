// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Admin.Compiler;

namespace Model.Admin.Visualization
{
    public class AdminVisualizationPage : IConstrainedResource
    {
        public Guid Id { get; set; }
        public string PageName { get; set; }
        public string PageDescription { get; set; }
        public Guid? CategoryId { get; set; }
        public IEnumerable<AdminVisualizationComponent> Components { get; set; }
        public int OrderId { get; set; }
        public IEnumerable<Constraint> Constraints { get; set; }

        public DateTime Created { get; set; }
        public string CreatedBy { get; set; }
        public DateTime Updated { get; set; }
        public string UpdatedBy { get; set; }
    }

    public class AdminVisualizationComponent
    {
        public Guid? Id { get; set; }
        public string Header { get; set; }
        public string SubHeader { get; set; }
        public string JsonSpec { get; set; }
        public IEnumerable<AdminVisualizationDatasetQueryRef> DatasetQueryRefs { get; set; }
        public bool IsFullWidth { get; set; }
        public int OrderId { get; set; }
    }

    public class AdminVisualizationDatasetQueryRef
    {
        public Guid Id { get; set; }
        public string UniversalId { get; set; }
        public string Name { get; set; }
        public Model.Compiler.Shape Shape { get; set; }
    }
}

 