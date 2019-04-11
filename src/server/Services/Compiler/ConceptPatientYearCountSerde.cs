// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Model.Compiler;

namespace Services.Compiler
{
    static class ConceptPatientYearCountSerde
    {
        public static IEnumerable<ConceptPatientYearCount> Deserialize(string json)
        {
            return string.IsNullOrWhiteSpace(json) ? null : JsonConvert.DeserializeObject<List<ConceptPatientYearCount>>(json);
        }

        public static string Serialize(IEnumerable<ConceptPatientYearCount> counts)
        {
            return counts == null ? null : JsonConvert.SerializeObject(counts);
        }
    }
}
