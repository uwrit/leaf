// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Integration.Shrine4_1;

namespace Model.Integration.Shrine
{
	public class ShrineRunQueryForResult
	{
		public ShrineQuery Query { get; set; }
		public ShrineNode Node { get; set; }
		public ShrineTopic Topic { get; set; }
		public ShrineResultProgress ResultProgress { get; set; }
		public ShrineResearcher Researcher { get; set; }
		public int ProtocolVersion { get; set; }
	}
}

