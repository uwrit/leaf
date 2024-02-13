// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Integration.Shrine;

namespace API.DTO.Integration.Shrine
{
    public class ShrineVersionInfoDTO
    {
        public int ProtocolVersion { get; set; }
        public int ItemVersion { get; set; }
        public string ShrineVersion { get; set; }
        public long CreateDate { get; set; }
        public long ChangeDate { get; set; }

        public ShrineVersionInfoDTO() { }

        public ShrineVersionInfoDTO(ShrineVersionInfo ver)
        {
            if (ver == null) return;

            ProtocolVersion = ver.ProtocolVersion;
            ItemVersion = ver.ItemVersion;
            ShrineVersion = ver.ShrineVersion;
            CreateDate = ((DateTimeOffset)ver.CreateDate).ToUnixTimeMilliseconds();
            ChangeDate = ((DateTimeOffset)ver.ChangeDate).ToUnixTimeMilliseconds();
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
                CreateDate = DateTimeOffset.FromUnixTimeMilliseconds(dto.CreateDate).UtcDateTime,
                ChangeDate = DateTimeOffset.FromUnixTimeMilliseconds(dto.ChangeDate).UtcDateTime
            };
        }
    }
}

