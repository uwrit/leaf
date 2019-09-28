// Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
using Model.Import;

namespace Services.Import
{
    public class ImportService : IImportService
    {
        readonly ILogger<ImportService> logger;
        readonly JsonSerializerSettings serializerSettings = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        public ImportService(ILogger<ImportService> logger)
        {
            this.logger = logger;
        }

        public Task<ImportMetadata> GetImportAsync(string id)
        {

        }

        public Task<ImportMetadata>
    }
}