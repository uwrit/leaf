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
        public int Count { get; set; } = -1;
        public ShrineResultObfuscatingParametersDTO ObfuscatingParameters { get; set; }

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
            EncodedClass = progress.EncodedClass.ToString();
            Count = progress.Count;
            ObfuscatingParameters = new ShrineResultObfuscatingParametersDTO(progress.ObfuscatingParameters);
        }
    }

    public class ShrineResultObfuscatingParametersDTO
    {
        public int BinSize { get; set; }
        public decimal StdDev { get; set; }
        public int NoiseClamp { get; set; }
        public int LowLimit { get; set; }

        public ShrineResultObfuscatingParametersDTO(ShrineResultObfuscatingParameters parameters)
        {
            if (parameters == null) return;
            BinSize = parameters.BinSize;
            StdDev = parameters.StdDev;
            NoiseClamp = parameters.NoiseClamp;
            LowLimit = parameters.LowLimit;
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
                CrcQueryInstanceId = dto.CrcQueryInstanceId,
                Count = dto.Count,
                ObfuscatingParameters = dto.ObfuscatingParameters?.ToParameters()
            };
        }

        public static ShrineResultObfuscatingParameters ToParameters(this ShrineResultObfuscatingParametersDTO dto)
        {
            if (dto == null) return null;
            return new ShrineResultObfuscatingParameters
            {
                BinSize = dto.BinSize,
                StdDev = dto.StdDev,
                NoiseClamp = dto.NoiseClamp,
                LowLimit = dto.LowLimit
            };
        }
    }
}

