// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Integration.Shrine;

namespace API.DTO.Integration.Shrine
{
	public class ShrineNodeDTO
	{
        public long Id { get; set; }
        public ShrineVersionInfoDTO VersionInfo { get; set; }
        public string Name { get; set; }
        public string Key { get; set; }
        public string UserDomainName { get; set; }
        public string MomQueueName { get; set; }
        public string AdminEmail { get; set; }
        public bool SendQueries { get; set; }
        public int UnderstandsProtocol { get; set; }
        public string MomId { get; set; }

        public ShrineNodeDTO()
        {

        }

        public ShrineNodeDTO(ShrineNode node)
        {
            Id = node.Id;
            VersionInfo = new ShrineVersionInfoDTO(node.VersionInfo);
            Name = node.Name;
            Key = node.Key;
            UserDomainName = node.UserDomainName;
            MomQueueName = node.MomQueueName;
            AdminEmail = node.AdminEmail;
            SendQueries = node.SendQueries;
            UnderstandsProtocol = node.UnderstandsProtocol;
            MomId = node.MomId;
        }
    }

    public static class ShrineNodeExtensions
    {
        public static ShrineNode ToNode(this ShrineNodeDTO dto)
        {
            if (dto == null) return null;

            return new ShrineNode
            {
                Id = dto.Id,
                VersionInfo = dto.VersionInfo.ToVersionInfo(),
                Name = dto.Name,
                Key = dto.Key,
                UserDomainName = dto.UserDomainName,
                MomQueueName = dto.MomQueueName,
                AdminEmail = dto.AdminEmail,
                SendQueries = dto.SendQueries,
                UnderstandsProtocol = dto.UnderstandsProtocol,
                MomId = dto.MomId
            };
        }
    }
}

