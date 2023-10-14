// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Integration.Shrine4_1;

namespace API.DTO.Integration.Shrine4_1
{
    public class ShrineStatusDTO
    {
        public string EncodedClass { get; set; }

        public ShrineStatusDTO() { }

        public ShrineStatusDTO(ShrineStatus status)
        {
            EncodedClass = status.EncodedClass.ToString();
        }
    }

    public static class ShrineStatusExtensions
    {
        public static ShrineStatus ToStatus(this ShrineStatusDTO dto)
        {
            _ = Enum.TryParse(dto.EncodedClass, out ShrineStatusType status);
            return new ShrineStatus
            {
                EncodedClass = status
            };
        }
    }
}

