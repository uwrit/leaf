// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Model.Integration.Shrine;

namespace API.DTO.Integration.Shrine
{
    public class ShrineUpdateQueryAtQepDTO
    {
        public long QueryId { get; set; }
        public ShrineQueryStatusDTO QueryStatus { get; set; }
        public long ChangeDate { get; set; }
        public string EncodedClass { get; set; }
        public IEnumerable<ShrineResultProgressDTO> ResultProgresses { get; set; }

        public ShrineUpdateQueryAtQepDTO() { }

        public ShrineUpdateQueryAtQepDTO(ShrineUpdateQueryAtQep update)
        {
            QueryId = update.QueryId;
            QueryStatus = new ShrineQueryStatusDTO(update.QueryStatus);
            ChangeDate = ((DateTimeOffset)update.ChangeDate).ToUnixTimeMilliseconds();
            EncodedClass = update.EncodedClass.ToString();

            if (update.ResultProgresses != null)
            {
                ResultProgresses = update.ResultProgresses.Select(p => new ShrineResultProgressDTO(p));
            }
        }
    }

    public static class ShrineUpdateQueryAtQepExtensions
    {
        public static ShrineUpdateQueryAtQep ToUpdate(this ShrineUpdateQueryAtQepDTO dto)
        {
            _ = Enum.TryParse(dto.EncodedClass, out ShrineQueryStatusType type);

            var output  = new ShrineUpdateQueryAtQep
            {
                QueryId = dto.QueryId,
                QueryStatus = dto.QueryStatus.ToStatus(),
                ChangeDate = DateTimeOffset.FromUnixTimeMilliseconds(dto.ChangeDate).UtcDateTime,
                EncodedClass = type
            };

            if (dto.ResultProgresses != null)
            {
                output.ResultProgresses = dto.ResultProgresses.Select(p => p.ToProgress());
            }

            return output;
        }
    }
}

