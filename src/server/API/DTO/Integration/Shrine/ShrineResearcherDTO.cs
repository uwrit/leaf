// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Integration.Shrine;

namespace API.DTO.Integration.Shrine
{
	public class ShrineResearcherDTO
	{
        public long Id { get; set; }
        public ShrineVersionInfoDTO VersionInfo { get; set; }
        public string UserName { get; set; }
        public string UserDomainName { get; set; }
        public long NodeId { get; set; }

        public ShrineResearcherDTO()
        {

        }

        public ShrineResearcherDTO(ShrineResearcher researcher)
        {
            Id = researcher.Id;
            VersionInfo = new ShrineVersionInfoDTO(researcher.VersionInfo);
            UserName = researcher.UserName;
            UserDomainName = researcher.UserDomainName;
            NodeId = researcher.NodeId;
        }
    }

    public static class ShrineResearcherExtensions
    {
        public static ShrineResearcher ToReseacher(this ShrineResearcherDTO dto)
        {
            if (dto == null) return null;
            return new ShrineResearcher
            {
                Id = dto.Id,
                VersionInfo = dto.VersionInfo.ToVersionInfo(),
                UserName = dto.UserName,
                UserDomainName = dto.UserDomainName,
                NodeId = dto.NodeId
            };
        }
    }
}

