// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Compiler;
using Model.Integration.Shrine4_1;
using Model.Tagging;

namespace Model.Integration.Shrine
{
	public interface IShrineQueryDefinitionConverter
	{
        IPatientCountQueryDTO ToLeafQuery(ShrineQuery shrineQuery);
        ShrineQuery ToShrineQuery(IPatientCountQueryDTO leafQuery);
    }

    public class ShrineQueryDefinitionConverter : IShrineQueryDefinitionConverter
    {
        public IPatientCountQueryDTO ToLeafQuery(ShrineQuery shrineQuery)
        {
            var panels = shrineQuery.QueryDefinition.Expression.Possibilities.Select((conceptGroup, i) =>
            {
                return new Panel
                {
                    IncludePanel = conceptGroup.NMustBeTrue > 0,
                    Index = i,
                    Domain = PanelDomain.Panel,
                    DateFilter = conceptGroup.StartDate.HasValue ?
                        new DateBoundary
                        {
                            Start = new DateFilter { Date = conceptGroup.StartDate.Value },
                            End = new DateFilter { Date = conceptGroup.EndDate.Value }
                        }
                        : null,
                    SubPanels = new List<SubPanel>
                    {
                        new SubPanel
                        {
                            IncludeSubPanel = true,
                            Index = 0,
                            MinimumCount = conceptGroup.NMustBeTrue,
                            PanelIndex = i,
                            PanelItems = conceptGroup.Concepts.Possibilities.Select((c,j) =>
                            {
                                var concept = (ShrineConcept)c;
                                _ = Urn.TryParse(concept.TermPath, out var urn);
                                return new PanelItem
                                {
                                    Index = j,
                                    SubPanelIndex = 0,
                                    PanelIndex = i,
                                    Concept = new Concept
                                    {
                                        UiDisplayName = concept.DisplayName,
                                        UiDisplayText = concept.DisplayName,
                                        UniversalId = urn
                                    }
                                };
                            })
                        }
                    }
                };
            }); 
        }

        public ShrineQuery ToShrineQuery(IPatientCountQueryDTO leafQuery)
        {
            return null;
        }
    }
}

