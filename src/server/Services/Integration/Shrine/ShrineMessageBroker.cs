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
using Model.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Services.Integration.Shrine
{
	public class ShrineMessageBroker : IShrineMessageBroker
	{
        readonly HttpClient client;
        readonly SHRINEOptions opts;

        public ShrineMessageBroker(HttpClient client, IOptions<IntegrationOptions> opts)
        {
            this.client = client;
            this.opts = opts.Value.SHRINE;
        }

        public async Task<ShrineDeliveryAttempt> ReadHubMessage()
        {
            var req = new HttpRequestMessage
            {
                RequestUri = new Uri($"{opts.HubApiURI}/shrine-api/mom/receiveMessage/{opts.LocalNodeName}?timeOutSeconds=50"),
                Method = HttpMethod.Get
            };

            var resp = await client.SendAsync(req);
            resp.EnsureSuccessStatusCode();

            var jsonString = await resp.Content.ReadAsStringAsync();
            var message = JsonConvert.DeserializeObject<ShrineDeliveryAttempt>(jsonString);

            var ack = new HttpRequestMessage
            {
                RequestUri = new Uri($"{opts.HubApiURI}/shrine-api/mom/acknowledge/{message.DeliveryAttemptId.Underlying}"),
                Method = HttpMethod.Put
            };
            _ = await client.SendAsync(ack);

            return message;
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

        // from https://stackoverflow.com/a/47046191
        private static void RecurseDeserialize(Dictionary<string, object> result)
        {
            //Iterate throgh key/value pairs
            foreach (var keyValuePair in result.ToArray())
            {
                //Check to see if Newtonsoft thinks this is a JArray
                var jarray = keyValuePair.Value as JArray;

                if (jarray != null)
                {
                    //Convert JArray back to json and deserialize to a list of dictionaries
                    var dictionaries = JsonConvert.DeserializeObject<List<Dictionary<string, object>>>(jarray.ToString());

                    //Set the result as the dictionary
                    result[keyValuePair.Key] = dictionaries;

                    //Iterate throught the dictionaries
                    foreach (var dictionary in dictionaries)
                    {
                        //Recurse
                        RecurseDeserialize(dictionary);
                    }
                }
            }
        }
    }
}

