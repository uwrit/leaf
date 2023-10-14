// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Integration.Shrine
{
	public class ShrineResultProgress
	{
		public long Id { get; set; }
		public ShrineVersionInfo VersionInfo { get; set; }
		public long QueryId { get; set; }
		public long AdapterNodeId { get; set; }
		public string AdapterNodeName { get; set; }
		public ShrineQueryStatus Status { get; set; }
		public string StatusMessage { get; set; }
		public long? CrcQueryInstanceId { get; set; }
		public ShrineQueryStatusType EncodedClass { get; set; }
		public int Count { get; set; } = -1;
        public ShrineResultObfuscatingParameters ObfuscatingParameters { get; set; }
    }

	public class ShrineResultObfuscatingParameters
	{
		public int BinSize { get; set; }
		public decimal StdDev { get; set; }
		public int NoiseClamp { get; set; }
		public int LowLimit { get; set; }
	}
}

