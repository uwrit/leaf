// Copyright (c) 20210, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Visualization
{
    public interface IVisualizationPage
    {
        Guid? Id { get; set; }
        string PageName { get; set; }
        string PageDescription { get; set; }
        string Category { get; set; }
        public IEnumerable<IVisualizationComponent> Components { get; set; }
        int OrderId { get; set; }
    }

    public interface IVisualizationComponent
    {
        Guid? Id { get; set; }
        string Header { get; set; }
        string SubHeader { get; set; }
        string JsonSpec { get; set; }
        IEnumerable<Guid> DatasetQueryIds { get; set; }
        bool IsFullWidth { get; set; }
        int OrderId { get; set; }
    }

    public class VisualizationPage : IVisualizationPage
    {
        public Guid? Id { get; set; }
        public string PageName { get; set; }
        public string PageDescription { get; set; }
        public string Category { get; set; }
        public IEnumerable<IVisualizationComponent> Components { get; set; }
        public int OrderId { get; set; }

        public VisualizationPage()
        {
            Components = new List<VisualizationComponent>();
        }
    }

    public class VisualizationComponent : IVisualizationComponent
    {
        public Guid? Id { get; set; }
        public string Header { get; set; }
        public string SubHeader { get; set; }
        public string JsonSpec { get; set; }
        public IEnumerable<Guid> DatasetQueryIds { get; set; }
        public bool IsFullWidth { get; set; }
        public int OrderId { get; set; }

        public VisualizationComponent()
        {
            DatasetQueryIds = new List<Guid>();
        }
    }
}

 