// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using API.DTO.Compiler;
using Model.Compiler;
using Model.Tagging;

namespace API.DTO.Cohort
{
    public class ConceptDatasetQueryDTO : IQueryDefinition
    {
        public string QueryId { get; set; }
        public IEnumerable<PanelDTO> Panels { get; set; }
        public IEnumerable<PanelFilterDTO> PanelFilters { get; set; }

        public ConceptDatasetQueryDTO(string queryId, string conceptId)
        {
            var res = new ResourceRef();

            if (Urn.TryParse(conceptId, out var urn ))
            {
                res.UniversalId = urn.Value;
            }
            else
            {
                res.Id = new Guid(conceptId);
            }

            var panel = new PanelDTO
            {
                SubPanels = new List<SubPanelDTO>
                {
                    new SubPanelDTO
                    {
                        PanelItems = new List<PanelItemDTO>
                        {
                            new PanelItemDTO
                            {
                                Resource = res
                            }
                        }
                    }
                }
            };

            QueryId = queryId;
            Panels = new List<PanelDTO> { panel };
            PanelFilters = new List<PanelFilterDTO>();
        }

        IEnumerable<IPanelDTO> all;
        IEnumerable<IPanelDTO> IQueryDefinition.All()
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
    }
}
