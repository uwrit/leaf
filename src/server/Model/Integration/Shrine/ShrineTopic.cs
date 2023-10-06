// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace Model.Integration.Shrine
{
	public class ShrineTopic
	{
		public long Id { get; set; }
		public ShrineVersionInfo VersionInfo { get; set; }
		public long ResearcherId { get; set; }
		public string Name { get; set; }
		public string Description { get; set; }
	}
}

