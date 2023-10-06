// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Model.Integration.Shrine;
using Model.Integration.Shrine.DTO;
using Model.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Services.Integration.Shrine
{
	public class ShrineMessageBroker : IShrineMessageBroker
	{
        readonly HttpClient client;
        readonly SHRINEOptions opts;
        readonly int TimeOutSeconds = 50;

        public ShrineMessageBroker(HttpClient client, IOptions<IntegrationOptions> opts)
        {
            this.client = client;
            this.opts = opts.Value.SHRINE;
        }

        public async Task<ShrineDeliveryContents> ReadHubMessageAndAcknowledge()
        {
            var req = new HttpRequestMessage
            {
                RequestUri = new Uri($"{opts.HubApiURI}/shrine-api/mom/receiveMessage/{opts.LocalNodeName}?timeOutSeconds={TimeOutSeconds}"),
                Method = HttpMethod.Get
            };

            var resp = await client.SendAsync(req);
            if (!resp.IsSuccessStatusCode) return null;

            var jsonMessage = await resp.Content.ReadAsStringAsync();
            var message = JsonConvert.DeserializeObject<ShrineDeliveryAttemptDTO>(jsonMessage).ToDeliveryAttempt();

            var ack = new HttpRequestMessage
            {
                RequestUri = new Uri($"{opts.HubApiURI}/shrine-api/mom/acknowledge/{message.DeliveryAttemptId.Underlying}"),
                Method = HttpMethod.Put
            };
            _ = await client.SendAsync(ack);

            var contents = JsonConvert.DeserializeObject<ShrineDeliveryContentsDTO>(message.Contents);

            return contents.ToContents();
        }

        private static string GetDeliveryAttemptId(string body)
        {
            var raw = JObject.Parse(body);

            if (raw.ContainsKey("deliveryAttemptId"))
            {
                return (string)raw["deliveryAttemptId"]["underlying"];
            }
            return null;
        }
    }
}

