// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Integration.Shrine4_1;

namespace API.DTO.Integration.Shrine4_1
{
    public class ShrineVersionInfoDTO
    {
        public int ProtocolVersion { get; set; }
        public int ItemVersion { get; set; }
        public string ShrineVersion { get; set; }
        public long CreateDate { get; set; }
        public long ChangeDate { get; set; }

        public ShrineVersionInfoDTO(ShrineVersionInfo ver)
        {
            ProtocolVersion = ver.ProtocolVersion;
            ItemVersion = ver.ItemVersion;
            ShrineVersion = ver.ShrineVersion;
            CreateDate = ((DateTimeOffset)ver.CreateDate).ToUnixTimeSeconds();
            ChangeDate = ((DateTimeOffset)ver.ChangeDate).ToUnixTimeSeconds();
        }
    }

    public static class ShrineVersionInfoExtensions
    {
        public static ShrineVersionInfo ToVersionInfo(this ShrineVersionInfoDTO dto)
        {
            return new ShrineVersionInfo
            {
                ProtocolVersion = dto.ProtocolVersion,
                ItemVersion = dto.ItemVersion,
                ShrineVersion = dto.ShrineVersion,
                CreateDate = DateTimeOffset.FromUnixTimeSeconds(dto.CreateDate).UtcDateTime,
                ChangeDate = DateTimeOffset.FromUnixTimeSeconds(dto.ChangeDate).UtcDateTime
            };
        }
    }
}

