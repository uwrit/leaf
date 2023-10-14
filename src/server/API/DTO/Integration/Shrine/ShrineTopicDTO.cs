// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Integration.Shrine;

namespace API.DTO.Integration.Shrine
{
	public class ShrineTopicDTO
	{
        public long Id { get; set; }
        public ShrineVersionInfoDTO VersionInfo { get; set; }
        public long ResearcherId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public ShrineTopicDTO()
        {

        }

        public ShrineTopicDTO(ShrineTopic topic)
        {
            Id = topic.Id;
            VersionInfo = new ShrineVersionInfoDTO(topic.VersionInfo);
            ResearcherId = topic.ResearcherId;
            Name = topic.Name;
            Description = topic.Description;
        }
    }

    public static class ShrineTopicExtensions
    {
        public static ShrineTopic ToTopic(this ShrineTopicDTO dto)
        {
            if (dto == null) return null;
            return new ShrineTopic
            {
                Id = dto.Id,
                VersionInfo = dto.VersionInfo.ToVersionInfo(),
                ResearcherId = dto.ResearcherId,
                Name = dto.Name,
                Description = dto.Description
            };
        }
    }
}

