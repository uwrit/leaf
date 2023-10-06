// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Integration.Shrine
{
	public class ShrineQueryResult
	{
		public long Id { get; set; }
		public DateTime Updated = DateTime.Now;
		public Dictionary<long, ShrineResultProgress> Results = new();

		public ShrineQueryResult(long id)
		{
			Id = id;
		}
    }
}

