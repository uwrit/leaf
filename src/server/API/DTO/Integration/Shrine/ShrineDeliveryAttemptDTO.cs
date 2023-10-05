// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Integration.Shrine;

namespace API.DTO.Integration.Shrine
{
    public class ShrineDeliveryAttemptDTO
    {
        public ShrineInnerDeliveryAttemptDTO DeliveryAttemptId { get; set; } = new ShrineInnerDeliveryAttemptDTO();
        public long MillisecondsToComplete { get; set; }
        public int RemainingAttempts { get; set; }
        public string Contents { get; set; }
    }

    public class ShrineInnerDeliveryAttemptDTO
    {
        public long Underlying { get; set; }
    }

    public class ShrineDeliveryContentsDTO
    {
        public string Contents { get; set; }
        public string ContentsType { get; set; }

        public ShrineDeliveryContentsDTO(ShrineDeliveryContents contents)
        {
            Contents = contents.Contents;
            ContentsType = contents.ContentsType.ToString();
        }
    }

    public static class ShrineDeliveryExtensions
    {
        public static ShrineDeliveryAttempt ToDeliveryAttempt(this ShrineDeliveryAttemptDTO dto)
        {
            if (dto == null) return null;
            return new ShrineDeliveryAttempt
            {
                DeliveryAttemptId = new ShrineInnerDeliveryAttempt
                {
                    Underlying = dto.DeliveryAttemptId.Underlying
                },
                MillisecondsToComplete = dto.MillisecondsToComplete,
                RemainingAttempts = dto.RemainingAttempts,
                Contents = dto.Contents
            };
        }
    }
}

