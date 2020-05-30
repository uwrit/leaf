// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;
using Model.Options;
using Microsoft.Extensions.Options;
using System.Net.Http;
using System.Threading.Tasks;
using System.Net.Http.Headers;
using Newtonsoft.Json;
using Model.Export;
using Newtonsoft.Json.Serialization;
using Microsoft.Extensions.Logging;


namespace Services.Export
{
    public class REDCapExportService : IREDCapExportService
    {
        readonly ILogger<REDCapExportService> logger;
        readonly REDCapExportOptions options;
        readonly HttpClient client;
        readonly JsonSerializerSettings serializerSettings = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        public REDCapExportService(IOptions<ExportOptions> options, HttpClient client, ILogger<REDCapExportService> logger)
        {
            this.options = options.Value.REDCap;
            this.client = client;
            this.logger = logger;
        }

        private Task<HttpResponseMessage> SubmitApiCall(string messageContent)
        {
            var request = new HttpRequestMessage
            {
                Method = HttpMethod.Post,
                RequestUri = new Uri(options.ApiURI)
            };
            request.Content = new StringContent(messageContent, Encoding.UTF8, "application/x-www-form-urlencoded");
            return client.SendAsync(request);
        }

        public async Task<string> GetREDCapVersion()
        {
            var content = $"token={options.SuperToken}&content=version&format=json";
            var response = await SubmitApiCall(content);
            if (response.IsSuccessStatusCode)
            {
                var version = await response.Content.ReadAsStringAsync();
                return version;
            }
            logger.LogError("Failed to get REDCap version. StatusCode:{StatusCode} Reason:{Reason}", (int)response.StatusCode, response.ReasonPhrase);
            throw new ExportException((int)response.StatusCode);
        }

        public async Task<string> CreateProject(REDCapProjectRequest projectRequest)
        {
            var json = $"[{JsonConvert.SerializeObject(projectRequest, serializerSettings)}]";
            var content = $"token={options.SuperToken}&content=project&format=json&data={json}";
            var response = await SubmitApiCall(content);
            if (response.IsSuccessStatusCode)
            {
                var token = await response.Content.ReadAsStringAsync();
                return token;
            }
            logger.LogError("Failed to create REDCap project. Project:{@Project} StatusCode:{StatusCode} Reason:{Reason}", projectRequest, (int)response.StatusCode, response.ReasonPhrase);
            throw new ExportException((int)response.StatusCode);
        }
    }
}
