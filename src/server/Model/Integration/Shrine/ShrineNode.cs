// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace Model.Integration.Shrine
{
	public class ShrineNode
	{
		public long Id { get; set; }
		public ShrineVersionInfo VersionInfo { get; set; }
		public string Name { get; set; }
		public string Key { get; set; }
		public string UserDomainName { get; set; }
		public string MomQueueName { get; set; }
		public string AdminEmail { get; set; }
		public bool SendQueries { get; set; }
		public int UnderstandsProtocol { get; set; }
		public string MomId { get; set; }
    }
}

