// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;

namespace Model.Integration.Shrine
{
	public class ShrineUpdateQueryAtQep
	{
		public long QueryId { get; set; }
		public ShrineQueryStatus QueryStatus { get; set; }
		public DateTime ChangeDate { get; set; }
		public ShrineQueryStatusType EncodedClass { get; set; }
		public IEnumerable<ShrineResultProgress> ResultProgresses { get; set; }

		public ShrineQueryResult ToQueryResult()
		{
			return new ShrineQueryResult(QueryId)
			{
				Updated = ChangeDate,
				Results = ResultProgresses?.ToDictionary(p => p.QueryId)
			};
		}
    }
}

