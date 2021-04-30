// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using API.DTO.Admin.Visualization;
using Model.Admin.Compiler;
using Model.Admin.Visualization;

namespace API.DTO.Admin.Visualization
{
    public class AdminVisualizationPageDTO
    {
        public Guid Id { get; set; }
        public string PageName { get; set; }
        public string PageDescription { get; set; }
        public int OrderId { get; set; }
        public IEnumerable<AdminVisualizationComponentDTO> Components { get; set; }
        public IEnumerable<Constraint> Constraints { get; set; }

        public DateTime Created { get; set; }
        public string CreatedBy { get; set; }
        public DateTime Updated { get; set; }
        public string UpdatedBy { get; set; }
    }

    public class AdminVisualizationComponentDTO
    {
        public Guid? Id { get; set; }
        public string Header { get; set; }
        public string SubHeader { get; set; }
        public string JsonSpec { get; set; }
        public IEnumerable<Guid> DatasetQueryIds { get; set; }
        public bool IsFullWidth { get; set; }
        public int OrderId { get; set; }
    }
}

public static class AdminVisualizationPageDTOExt
{
    public static AdminVisualizationPageDTO AdminVisualizationPageDTO(this AdminVisualizationPage vp)
    {
        if (vp == null) return null;
        return new AdminVisualizationPageDTO
        {
            Id = vp.Id,
            PageName = vp.PageName,
            PageDescription = vp.PageDescription,
            OrderId = vp.OrderId,
            Components = vp.Components.Select(c => c.AdminVisualizationComponentDTO()),
            Constraints = vp.Constraints,
            Created = vp.Created,
            CreatedBy = vp.CreatedBy,
            Updated = vp.Updated,
            UpdatedBy = vp.UpdatedBy
        };
    }

    public static AdminVisualizationPage AdminVisualizationPage(this AdminVisualizationPageDTO dto)
    {
        if (dto == null) return null;
        return new AdminVisualizationPage
        {
            Id = dto.Id,
            PageName = dto.PageName,
            PageDescription = dto.PageDescription,
            OrderId = dto.OrderId,
            Components = dto.Components.Select(c => c.AdminVisualizationComponent()),
            Constraints = dto.Constraints,
            Created = dto.Created,
            CreatedBy = dto.CreatedBy,
            Updated = dto.Updated,
            UpdatedBy = dto.UpdatedBy
        };
    }

    public static AdminVisualizationComponentDTO AdminVisualizationComponentDTO(this AdminVisualizationComponent vc)
    {
        if (vc == null) return null;
        return new AdminVisualizationComponentDTO
        {
            Id = vc.Id,
            Header = vc.Header,
            SubHeader = vc.SubHeader,
            JsonSpec = vc.JsonSpec,
            DatasetQueryIds = vc.DatasetQueryIds,
            IsFullWidth = vc.IsFullWidth,
            OrderId = vc.OrderId
        };
    }

    public static AdminVisualizationComponent AdminVisualizationComponent(this AdminVisualizationComponentDTO dto)
    {
        if (dto == null) return null;
        return new AdminVisualizationComponent
        {
            Id = dto.Id,
            Header = dto.Header,
            SubHeader = dto.SubHeader,
            JsonSpec = dto.JsonSpec,
            DatasetQueryIds = dto.DatasetQueryIds,
            IsFullWidth = dto.IsFullWidth,
            OrderId = dto.OrderId
        };
    }
}