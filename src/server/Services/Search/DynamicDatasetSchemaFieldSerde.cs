// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Model.Compiler;

namespace Services.Search
{
    public class DynamicDatasetSchemaFieldSerde
    {
        readonly static JsonSerializerSettings settings = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        public static DynamicDatasetQuerySchema Deserialize(string json)
        {
            return string.IsNullOrWhiteSpace(json) ? null : JsonConvert.DeserializeObject<DynamicDatasetQuerySchema>(json, settings);
        }

        public static string Serialize(DynamicDatasetQuerySchema schema)
        {
            return schema == null ? null : JsonConvert.SerializeObject(schema, settings);
        }
    }
}
