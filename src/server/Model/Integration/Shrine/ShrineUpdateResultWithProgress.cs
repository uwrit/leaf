// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace Model.Integration.Shrine
{
	public class ShrineUpdateResultWithProgress
	{
        public long QueryId { get; set; }
        public string AdapterNodeKey { get; set; }
        public ShrineQueryStatus Status { get; set; }
        public string StatusMessage { get; set; }
        public long? CrcQueryInstanceId { get; set; }
        public DateTime AdapterTime { get; set; }
        public ShrineQueryStatusType EncodedClass { get; set; }
    }
}

