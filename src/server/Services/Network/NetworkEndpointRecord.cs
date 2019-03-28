// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Network;

namespace Services.Network
{
    public class NetworkEndpointRecord
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string Address { get; set; }

        public string Issuer { get; set; }

        public string KeyId { get; set; }

        public string Certificate { get; set; }

        public NetworkEndpointRecord()
        {

        }

        public NetworkEndpointRecord(NetworkEndpoint ne)
        {
            Id = ne.Id;
            Name = ne.Name;
            Address = ne.Address.AbsoluteUri;
            Issuer = ne.Issuer;
            KeyId = ne.KeyId;
            Certificate = Convert.ToBase64String(ne.Certificate);
        }

        public NetworkEndpoint ToNetworkEndpoint()
        {
            return new NetworkEndpoint
            {
                Id = Id,
                Name = Name,
                Address = new Uri(Address),
                Issuer = Issuer,
                KeyId = KeyId,
                Certificate = Convert.FromBase64String(Certificate)
            };
        }
    }
}
