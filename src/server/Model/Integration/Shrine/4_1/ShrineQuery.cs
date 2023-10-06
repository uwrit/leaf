// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Integration.Shrine;

namespace Model.Integration.Shrine4_1
{
	public class ShrineQuery
	{
		public long Id { get; set; }
		public ShrineVersionInfo VersionInfo { get; set; }
		public ShrineStatus Status { get; set; }
		public ShrineQueryDefinition QueryDefinition { get; set; }
		public ShrineOutput Output { get; set; }
		public string QueryName { get; set; }
		public long NodeOfOriginId { get; set; }
		public long ResearcherId { get; set; }
		public int TopicId { get; set; }
		public string ProjectName { get; set; }
		public bool Flagged { get; set; } = false;
		public string FlaggedMessage { get; set; }
		public ShrineQueryType EncodedClass { get; set; }
    }

	public enum ShrineQueryType
	{
		QueryProgress
	}
}

