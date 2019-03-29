// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Network
{
    public class NetworkEndpoint : IUriAddress
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Uri Address { get; set; }
        public string Issuer { get; set; }
        public string KeyId { get; set; }
        public byte[] Certificate { get; set; }
    }
}