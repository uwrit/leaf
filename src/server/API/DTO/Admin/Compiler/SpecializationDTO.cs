// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Tagging;
using Model.Admin;
using System.Collections.Generic;
using System.Linq;
using Model.Admin.Compiler;

namespace API.DTO.Admin.Compiler
{
    public class SpecializationDTO
    {
        public Guid Id { get; set; }
        public int SpecializationGroupId { get; set; }
        public string UniversalId { get; set; }
        public string UiDisplayText { get; set; }
        public string SqlSetWhere { get; set; }
        public int? OrderId { get; set; }

        public static SpecializationDTO From(Specialization cs)
        {
            if (cs == null) return null;
            return new SpecializationDTO
            {
                Id = cs.Id,
                SpecializationGroupId = cs.SpecializationGroupId,
                UniversalId = cs.UniversalId?.ToString(),
                UiDisplayText = cs.UiDisplayText,
                SqlSetWhere = cs.SqlSetWhere,
                OrderId = cs.OrderId
            };
        }

        public Specialization ConceptSpecialization()
        {
            return new Specialization
            {
                Id = Id,
                SpecializationGroupId = SpecializationGroupId,
                UniversalId = SpecializationUrn.From(UniversalId),
                UiDisplayText = UiDisplayText,
                SqlSetWhere = SqlSetWhere,
                OrderId = OrderId
            };
        }
    }

    public class SpecializationGroupDTO
    {
        public int Id { get; set; }
        public int SqlSetId { get; set; }
        public IEnumerable<SpecializationDTO> Specializations { get; set; }
        public string UiDefaultText { get; set; }

        public static SpecializationGroupDTO From(SpecializationGroup sg)
        {
            if (sg == null) return null;
            return new SpecializationGroupDTO
            {
                Id = sg.Id,
                SqlSetId = sg.SqlSetId,
                Specializations = sg.Specializations.Select(SpecializationDTO.From),
                UiDefaultText = sg.UiDefaultText
            };
        }
    }

    public static class SpecializationGroupExtensions
    {
        public static SpecializationGroup SpecializationGroup(this SpecializationGroupDTO dto)
        {
            if (dto == null) return null;
            return new SpecializationGroup
            {
                Id = dto.Id,
                SqlSetId = dto.SqlSetId,
                Specializations = dto.Specializations.Select(s => s.ConceptSpecialization()),
                UiDefaultText = dto.UiDefaultText
            };
        }
    }
}
