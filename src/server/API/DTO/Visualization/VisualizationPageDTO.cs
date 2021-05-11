// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Model.Visualization;

namespace API.DTO.Visualization
{
    public class VisualizationPageDTO
    {
        public Guid? Id { get; set; }
        public string PageName { get; set; }
        public string PageDescription { get; set; }
        public string Category { get; set; }
        public IEnumerable<VisualizationComponentDTO> Components { get; set; }
        public int OrderId { get; set; }

        public VisualizationPageDTO(IVisualizationPage page)
        {
            Id = page.Id;
            PageName = page.PageName;
            PageDescription = page.PageDescription;
            Category = page.Category;
            Components = page.Components.Select(c => new VisualizationComponentDTO(c));
            OrderId = page.OrderId;
        }
    }

    public class VisualizationComponentDTO
    {
        public Guid? Id { get; set; }
        public string Header { get; set; }
        public string SubHeader { get; set; }
        public string JsonSpec { get; set; }
        public IEnumerable<VisualizationDatasetQueryRefDTO> DatasetQueryRefs { get; set; }
        public bool IsFullWidth { get; set; }
        public int OrderId { get; set; }

        public VisualizationComponentDTO(IVisualizationComponent vc)
        {
            Id = vc.Id;
            Header = vc.Header;
            SubHeader = vc.SubHeader;
            JsonSpec = vc.JsonSpec;
            DatasetQueryRefs = vc.DatasetQueryRefs.Select(dsref => new VisualizationDatasetQueryRefDTO(dsref));
            IsFullWidth = vc.IsFullWidth;
            OrderId = vc.OrderId;
        }
    }

    public class VisualizationDatasetQueryRefDTO
    {
        public Guid? Id { get; set; }
        public string UniversalId { get; set; }
        public string Name { get; set; }
        public Model.Compiler.Shape Shape { get; set; }

        public VisualizationDatasetQueryRefDTO(IVisualizationDatasetQueryRef dsref)
        {
            Id = dsref.Id;
            UniversalId = dsref.UniversalId;
            Name = dsref.Name;
            Shape = dsref.Shape;
        }
    }
}
