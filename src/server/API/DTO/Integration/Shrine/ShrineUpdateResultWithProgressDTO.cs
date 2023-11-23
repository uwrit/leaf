// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Integration.Shrine;

namespace API.DTO.Integration.Shrine
{
	public class ShrineUpdateResultWithProgressDTO
	{
        public long QueryId { get; set; }
        public string AdapterNodeKey { get; set; }
        public ShrineQueryStatusDTO Status { get; set; }
        public string StatusMessage { get; set; }
        public long? CrcQueryInstanceId { get; set; }
        public long AdapterTime { get; set; }
        public string EncodedClass { get; set; }

        public ShrineUpdateResultWithProgressDTO(ShrineUpdateResultWithProgress update)
        {
            QueryId = update.QueryId;
            AdapterNodeKey = update.AdapterNodeKey;
            Status = new ShrineQueryStatusDTO(update.Status);
            StatusMessage = update.StatusMessage;
            CrcQueryInstanceId = update.CrcQueryInstanceId;
            AdapterTime = ((DateTimeOffset)update.AdapterTime).ToUnixTimeMilliseconds();
            EncodedClass = update.EncodedClass.ToString();
        }
    }

    public static class ShrineUpdateResultWithProgressDTOExtensions
    {
        public static ShrineUpdateResultWithProgress ToUpdate(this ShrineUpdateResultWithProgressDTO dto)
        {
            _ = Enum.TryParse(dto.EncodedClass, out ShrineQueryStatusType type);

            var output = new ShrineUpdateResultWithProgress
            {
                QueryId = dto.QueryId,
                AdapterNodeKey = dto.AdapterNodeKey,
                Status = dto.Status.ToStatus(),
                StatusMessage = dto.StatusMessage,
                CrcQueryInstanceId = dto.CrcQueryInstanceId,
                AdapterTime = DateTimeOffset.FromUnixTimeMilliseconds(dto.AdapterTime).UtcDateTime,
                EncodedClass = type
            };

            return output;
        }
    }
}

