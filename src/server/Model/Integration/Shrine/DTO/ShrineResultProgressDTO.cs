// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace Model.Integration.Shrine.DTO
{
    public class ShrineResultProgressDTO
    {
        public long Id { get; set; }
        public ShrineVersionInfoDTO VersionInfo { get; set; }
        public long QueryId { get; set; }
        public long AdapterNodeId { get; set; }
        public string AdapterNodeName { get; set; }
        public ShrineQueryStatusDTO Status { get; set; }
        public string StatusMessage { get; set; }
        public long CrcQueryInstanceId { get; set; }
        public string EncodedClass { get; set; }

        public ShrineResultProgressDTO(ShrineResultProgress progress)
        {
            Id = progress.Id;
            VersionInfo = new ShrineVersionInfoDTO(progress.VersionInfo);
            QueryId = progress.QueryId;
            AdapterNodeId = progress.AdapterNodeId;
            AdapterNodeName = progress.AdapterNodeName;
            Status = new ShrineQueryStatusDTO(progress.Status);
            StatusMessage = progress.StatusMessage;
            CrcQueryInstanceId = progress.CrcQueryInstanceId;
        }
    }

    public static class ShrineResultProgressExtensions
    {
        public static ShrineResultProgress ToProgress(this ShrineResultProgressDTO dto)
        {
            return new ShrineResultProgress
            {
                Id = dto.Id,
                VersionInfo = dto.VersionInfo.ToVersionInfo(),
                QueryId = dto.QueryId,
                AdapterNodeId = dto.AdapterNodeId,
                AdapterNodeName = dto.AdapterNodeName,
                Status = dto.Status.ToStatus(),
                StatusMessage = dto.StatusMessage,
                CrcQueryInstanceId = dto.CrcQueryInstanceId
            };
        }
    }
}

