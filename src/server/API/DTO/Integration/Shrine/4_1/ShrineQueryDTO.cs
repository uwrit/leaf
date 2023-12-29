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
        public ShrineQueryDefinitionDTO QueryDefinition { get; set; }
        public ShrineAnonymousEncodedClassDTO Output { get; set; }
        public ShrineAnonymousEncodedClassDTO Status { get; set; }
        public string QueryName { get; set; }
        public long NodeOfOriginId { get; set; }
        public long ResearcherId { get; set; }
        public int TopicId { get; set; }
        public string ProjectName { get; set; }
        public bool Flagged { get; set; }
        public string FlaggedMessage { get; set; }
        public string EncodedClass { get; set; }

        public ShrineQueryDTO() { }

        public ShrineQueryDTO(ShrineQuery query)
        {
            Id = query.Id;
            VersionInfo = new ShrineVersionInfoDTO(query.VersionInfo);
            QueryDefinition = new ShrineQueryDefinitionDTO(query.QueryDefinition);
            Status = new ShrineAnonymousEncodedClassDTO(query.Status.ToString());
            Output = new ShrineAnonymousEncodedClassDTO(query.Output.ToString());
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
        public static ShrineQuery ToQuery(this ShrineQueryDTO dto)
        {
            _ = Enum.TryParse(dto.EncodedClass, out ShrineQueryType type);
            _ = Enum.TryParse(dto.Status.EncodedClass, out ShrineStatusType status);
            _ = Enum.TryParse(dto.Output.EncodedClass, out ShrineOutputType output);

            return new ShrineQuery
            {
                Id = dto.Id,
                VersionInfo = dto.VersionInfo.ToVersionInfo(),
                Status = status,
                QueryDefinition = dto.QueryDefinition.ToDefinition(),
                Output = output,
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

