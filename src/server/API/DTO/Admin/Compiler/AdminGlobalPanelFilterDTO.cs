// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Admin.Compiler;

namespace API.DTO.Admin.Compiler
{
    public class GlobalPanelFilterDTO
    {
        public int Id { get; set; }
        public AccessMode AccessMode { get; set; }
        public bool IsInclusion { get; set; }
        public int SqlSetId { get; set; }
        public string SqlSetWhere { get; set; }

        public GlobalPanelFilterDTO() { }

        public GlobalPanelFilterDTO(AdminGlobalPanelFilter filter)
        {
            Id = filter.Id;
            AccessMode = filter.AccessMode;
            IsInclusion = filter.IsInclusion;
            SqlSetId = filter.SqlSetId;
            SqlSetWhere = filter.SqlSetWhere;
        }
    }
}
