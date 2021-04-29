// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Services.Search
{
    class VisualizationPageRecord
    {
        public Guid? Id { get; set; }
        public string PageName { get; set; }
        public string PageDescription { get; set; }
        public int OrderId { get; set; }
    }

    class VisualizationComponentRecord
    {
        public Guid? Id { get; set; }
        public Guid? VisualizationPageId { get; set; }
        public string Header { get; set; }
        public string SubHeader { get; set; }
        public string JsonSpec { get; set; }
        public bool IsFullWidth { get; set; }
        public int OrderId { get; set; }
    }

    class VisualizationComponentDatasetIdRecord
    {
        public Guid VisualizationPageId { get; set; }
        public Guid VisualizationComponentId { get; set; }
        public Guid DatasetQueryId { get; set; }
    }
}
    