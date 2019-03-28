// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace DTO.Compiler
{
    public class QueryDefinitionDTO
    {
        public IReadOnlyCollection<PanelDTO> Panels { get; set; }
        public IReadOnlyCollection<PanelFilterDTO> PanelFilters { get; set; }

        public static string JSON(QueryDefinitionDTO dto)
        {
            return JsonConvert.SerializeObject(dto, new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            });
        }
    }
}
