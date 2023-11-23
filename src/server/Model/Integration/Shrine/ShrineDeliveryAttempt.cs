// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Integration.Shrine
{
	public class ShrineDeliveryAttempt
	{
		public ShrineInnerDeliveryAttempt DeliveryAttemptId { get; set; } = new ShrineInnerDeliveryAttempt();
		public long MillisecondsToComplete { get; set; }
		public int RemainingAttempts { get; set; }
		public string Contents { get; set; }
	}

	public class ShrineInnerDeliveryAttempt
	{
		public long Underlying { get; set; }
	}

	public class ShrineDeliveryContents
	{
		public string Contents { get; set; }
		public long ContentsSubject { get; set; }
		public ShrineDeliveryContentsType ContentsType { get; set; }
		public int ProtocolVersion = 2;
    }

	public enum ShrineDeliveryContentsType
	{
		Unknown,
		UpdateQueryAtQep,
		RunQueryForResult,
		RunQueryAtHub,
		Result,
		UpdateResult
	}
}

