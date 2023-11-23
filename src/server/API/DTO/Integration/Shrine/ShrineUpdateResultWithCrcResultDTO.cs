// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Integration.Shrine;

namespace API.DTO.Integration.Shrine
{
	public class ShrineUpdateResultWithCrcResultDTO : ShrineUpdateResultWithProgressDTO
	{
		public string Breakdowns { get; set; }
		public ShrineResultObfuscatingParametersDTO ObfuscatingParameters { get; set; }
		public int Count { get; set; }

		public ShrineUpdateResultWithCrcResultDTO(ShrineUpdateResultWithCrcResult update) : base(update)
		{
			ObfuscatingParameters = new ShrineResultObfuscatingParametersDTO(update.ObfuscatingParameters);
			Count = update.Count;
		}
    }

    public static class ShrineUpdateResultWithCrcResultDTOExtensions
    {
        public static ShrineUpdateResultWithCrcResult ToUpdate(this ShrineUpdateResultWithCrcResultDTO dto)
        {
            _ = Enum.TryParse(dto.EncodedClass, out ShrineQueryStatusType type);

            var output = new ShrineUpdateResultWithCrcResult
            {
                QueryId = dto.QueryId,
                AdapterNodeKey = dto.AdapterNodeKey,
                Status = dto.Status.ToStatus(),
                StatusMessage = dto.StatusMessage,
                CrcQueryInstanceId = dto.CrcQueryInstanceId,
                AdapterTime = DateTimeOffset.FromUnixTimeMilliseconds(dto.AdapterTime).UtcDateTime,
                EncodedClass = type,
                ObfuscatingParameters = dto.ObfuscatingParameters.ToParameters(),
                Count = dto.Count
            };

            return output;
        }
    }
}

