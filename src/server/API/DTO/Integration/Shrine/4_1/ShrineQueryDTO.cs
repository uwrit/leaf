// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using API.DTO.Integration.Shrine;
using Model.Integration.Shrine4_1;

namespace API.DTO.Integration.Shrine4_1
{
    public class ShrineQueryDTO
    {
        public long Id { get; set; }
        public ShrineVersionInfoDTO VersionInfo { get; set; }
        public ShrineStatusDTO Status { get; set; }
        public ShrineQueryDefinitionDTO QueryDefinition { get; set; }
        public ShrineOutputDTO Output { get; set; }
        public string QueryName { get; set; }
        public long NodeOfOriginId { get; set; }
        public long ResearcherId { get; set; }
        public int TopicId { get; set; }
        public string ProjectName { get; set; }
        public bool Flagged { get; set; }
        public string FlaggedMessage { get; set; }
        public string EncodedClass { get; set; }

        public ShrineQueryDTO(ShrineQuery query)
        {
            Id = query.Id;
            VersionInfo = new ShrineVersionInfoDTO(query.VersionInfo);
            Status = new ShrineStatusDTO(query.Status);
            QueryDefinition = new ShrineQueryDefinitionDTO(query.QueryDefinition);
            Output = new ShrineOutputDTO(query.Output);
            QueryName = query.QueryName;
            NodeOfOriginId = query.NodeOfOriginId;
            ResearcherId = query.ResearcherId;
            TopicId = query.TopicId;
            ProjectName = query.ProjectName;
            Flagged = query.Flagged;
            FlaggedMessage = query.FlaggedMessage;
            EncodedClass = query.EncodedClass.ToString();
        }
    }

    public static class ShrineQueryExtensions
    {
        public static ShrineQuery ToQuery(ShrineQueryDTO dto)
        {
            _ = Enum.TryParse(dto.EncodedClass, out ShrineQueryType type);
            return new ShrineQuery
            {
                Id = dto.Id,
                VersionInfo = dto.VersionInfo.ToVersionInfo(),
                Status = dto.Status.ToStatus(),
                QueryDefinition = dto.QueryDefinition.ToDefinition(),
                Output = dto.Output.ToOutput(),
                QueryName = dto.QueryName,
                NodeOfOriginId = dto.NodeOfOriginId,
                ResearcherId = dto.ResearcherId,
                TopicId = dto.TopicId,
                ProjectName = dto.ProjectName,
                Flagged = dto.Flagged,
                FlaggedMessage = dto.FlaggedMessage,
                EncodedClass = type
            };
        }
    }
}

