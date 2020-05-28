// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Threading.Tasks;
using Model.Network;
using System.Net;
using System.Net.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Model.Authentication;

namespace Services.Network
{
    public class NetworkEndpointRefresher : INetworkEndpointRefresher
    {
        readonly HttpClient client;

        public NetworkEndpointRefresher(HttpClient client)
        {
            this.client = client;
        }

        public async Task<NetworkEndpoint> Refresh(NetworkEndpoint ne)
        {
            var req = new HttpRequestMessage
            {
                RequestUri = new Uri(ne.Address, "/api/network/certificate"),
                Method = HttpMethod.Get
            };

            var resp = await client.SendAsync(req);
            resp.EnsureSuccessStatusCode();

            var body = await resp.Content.ReadAsStringAsync();
            var cert = JsonConvert.DeserializeObject<Certificate>(body);

            return new NetworkEndpoint
            {
                Id = ne.Id,
                Name = ne.Name,
                Address = ne.Address,
                Issuer = ne.Issuer,
                KeyId = cert.KeyId,
                Certificate = Convert.FromBase64String(cert.Data),
                IsResponder = ne.IsResponder,
                IsInterrogator = ne.IsInterrogator,
                Created = ne.Created,
                Updated = DateTime.Now
            };
        }
    }
}
