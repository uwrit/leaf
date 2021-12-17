// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Model.Compiler;

namespace API.DTO.Compiler
{
    public class QueryDefinitionDTO : IQueryDefinition
    {
        public IEnumerable<PanelDTO> Panels { get; set; }
        public IEnumerable<PanelFilterDTO> PanelFilters { get; set; }

        IEnumerable<IPanelDTO> all;
        public IEnumerable<IPanelDTO> All()
        {
            if (all == null)
            {
                all = this.MergeAll();
            }
            return all;
        }

        IEnumerable<IPanelDTO> IQueryDefinition.Panels
        {
            get => Panels;
            set => Panels = value as IEnumerable<PanelDTO>;
        }
        IEnumerable<IPanelFilterDTO> IQueryDefinition.PanelFilters
        {
            get => PanelFilters;
            set => PanelFilters = value as IEnumerable<PanelFilterDTO>;
        }

        public static string JSON(IQueryDefinition dto)
        {
            return JsonConvert.SerializeObject(dto, new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            });
        }
    }
}
