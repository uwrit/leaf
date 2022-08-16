// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace Services.Search
{
    static class ColumnNamesSerde
    {
        public static Dictionary<string, string> Deserialize(string json)
        {
            return string.IsNullOrWhiteSpace(json) ? new Dictionary<string, string>() : JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
        }

        public static string Serialize(Dictionary<string, string> keyValues)
        {
            return keyValues == null ? null : JsonConvert.SerializeObject(keyValues);
        }
    }
}

