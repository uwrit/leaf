// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using API.DTO.Integration.Shrine4_1;
using Model.Integration.Shrine;

namespace API.DTO.Integration.Shrine
{
	public class ShrineRunQueryForResultDTO
	{
        public ShrineQueryDTO Query { get; set; }
        public ShrineNodeDTO Node { get; set; }
        public ShrineTopicDTO Topic { get; set; }
        public ShrineResultProgressDTO ResultProgress { get; set; }
        public ShrineResearcherDTO Researcher { get; set; }
        public int ProtocolVersion { get; set; }

        public ShrineRunQueryForResultDTO()
        {

        }

        public ShrineRunQueryForResultDTO(ShrineRunQueryForResult runQueryForResult)
        {
            Query = new ShrineQueryDTO(runQueryForResult.Query);
            Node = runQueryForResult.Node != null ? new ShrineNodeDTO(runQueryForResult.Node) : null;
            Topic = runQueryForResult.Topic != null ? new ShrineTopicDTO(runQueryForResult.Topic) : null;
            ResultProgress = runQueryForResult.ResultProgress != null ? new ShrineResultProgressDTO(runQueryForResult.ResultProgress) : null;
            Researcher = runQueryForResult.Researcher != null ? new ShrineResearcherDTO(runQueryForResult.Researcher) : null;
            ProtocolVersion = runQueryForResult.ProtocolVersion;
        }
    }

    public static class ShrineRunQueryForResultExtensions
    {
        public static ShrineRunQueryForResult ToRunQueryForResult(this ShrineRunQueryForResultDTO dto)
        {
            if (dto == null) return null;
            return new ShrineRunQueryForResult
            {
                Query = dto?.Query.ToQuery(),
                Node = dto?.Node.ToNode(),
                Topic = dto?.Topic.ToTopic(),
                ResultProgress = dto?.ResultProgress.ToProgress(),
                Researcher = dto?.Researcher.ToReseacher()
            };
        }
    }
}

