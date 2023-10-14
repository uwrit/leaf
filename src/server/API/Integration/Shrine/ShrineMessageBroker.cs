// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using API.DTO.Integration.Shrine;
using Microsoft.Extensions.Options;
using Model.Integration.Shrine;
using Model.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace API.Integration.Shrine
{
    public interface IShrineMessageBroker
    {
        Task<(HttpResponseMessage, ShrineDeliveryContents)> ReadHubMessageAndAcknowledge();
        Task<HttpResponseMessage> SendMessageToHub(ShrineDeliveryContents contents);
    }

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

        public async Task<(HttpResponseMessage, ShrineDeliveryContents)> ReadHubMessageAndAcknowledge()
        {
            var req = new HttpRequestMessage
            {
                RequestUri = new Uri($"{opts.HubApiURI}/shrine-api/mom/receiveMessage/{opts.Node.Name}?timeOutSeconds={TimeOutSeconds}"),
                Method = HttpMethod.Get
            };

            var resp = await client.SendAsync(req);
            if (!resp.IsSuccessStatusCode || resp.Content == null)
            {
                req.Dispose();
                return (resp, null);
            }

            var jsonMessage = await resp.Content.ReadAsStringAsync();
            var message = JsonConvert.DeserializeObject<ShrineDeliveryAttemptDTO>(jsonMessage).ToDeliveryAttempt();
            req.Dispose();

            var ack = new HttpRequestMessage
            {
                RequestUri = new Uri($"{opts.HubApiURI}/shrine-api/mom/acknowledge/{message.DeliveryAttemptId.Underlying}"),
                Method = HttpMethod.Put
            };
            _ = await client.SendAsync(ack);
            ack.Dispose();

            var contents = JsonConvert.DeserializeObject<ShrineDeliveryContentsDTO>(message.Contents);

            return (resp, contents.ToContents());
        }

        public async Task<HttpResponseMessage> SendMessageToHub(ShrineDeliveryContents contents)
        {
            var request = new HttpRequestMessage
            {
                RequestUri = new Uri($"{opts.HubApiURI}/shrine-api/mom/sendMessage/hub"),
                Method = HttpMethod.Put,
                Content = new StringContent(
                    JsonConvert.SerializeObject(new ShrineDeliveryContentsDTO(contents)),
                    Encoding.UTF8,
                    "application/x-www-form-urlencoded"
                )
            };
            var response = await client.SendAsync(request);
            request.Dispose();

            return response;
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

