// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using API.DTO.Cohort;
using API.DTO.Compiler;
using Model.Compiler;
using Model.Integration.Shrine;
using Model.Integration.Shrine4_1;

namespace API.Integration.Shrine4_1
{
    public class ShrineQueryDefinitionConverter
    {
        readonly string UniversalIdPrefix = $"urn:leaf:concept:shrine:";

        public IPatientCountQueryDTO ToLeafQuery(ShrineQuery shrineQuery)
        {
            var possibilities = shrineQuery.QueryDefinition.Expression.Possibilities;
            var panels = possibilities.Select(
                (grp, i) => grp.IsConceptGroup ? ShrineConceptGroupToPanelDTO(grp, i) : ShrineTimelineToPanelDTO(grp, i)
            );

            return new PatientCountQueryDTO
            {
                QueryId = Guid.NewGuid().ToString(),
                Panels = panels,
                PanelFilters = Array.Empty<PanelFilterDTO>()
            };
        }

        PanelDTO ShrineConceptGroupToPanelDTO(ShrineConceptGroup conceptGroup, int i)
        {
            return new PanelDTO
            {
                IncludePanel = conceptGroup.Concepts.NMustBeTrue > 0,
                Index = i,
                Domain = PanelDomain.Panel,
                DateFilter = conceptGroup.StartDate.HasValue ?
                        new DateBoundary
                        {
                            Start = new DateFilter { Date = conceptGroup.StartDate.Value },
                            End = new DateFilter { Date = conceptGroup.EndDate.Value }
                        }
                        : null,
                SubPanels = new List<SubPanelDTO>
                    {
                        new SubPanelDTO
                        {
                            IncludeSubPanel = true,
                            Index = 0,
                            MinimumCount = conceptGroup.OccursAtLeast.HasValue ? (int)conceptGroup.OccursAtLeast : 1,
                            PanelIndex = i,
                            PanelItems = conceptGroup.Concepts.Possibilities.Select((c,j) =>
                            {
                                return new PanelItemDTO
                                {
                                    Index = j,
                                    SubPanelIndex = 0,
                                    PanelIndex = i,
                                    Resource = new ResourceRef
                                    {
                                        UiDisplayName = c.DisplayName,
                                        UniversalId = UniversalIdPrefix + c.TermPath
                                    }
                                };
                            })
                        }
                    }
            };
        }

        PanelDTO ShrineTimelineToPanelDTO(ShrineConceptGroupOrTimeline timeline, int i)
        {
            var first = new SubPanelDTO
            {
                IncludeSubPanel = timeline.First.NMustBeTrue > 0,
                Index = 0,
                MinimumCount = timeline.First.NMustBeTrue,
                PanelIndex = i,
                PanelItems = timeline.First.Concepts.Possibilities.Select((c, j) =>
                {
                    return new PanelItemDTO
                    {
                        Index = j,
                        SubPanelIndex = 0,
                        PanelIndex = i,
                        Resource = new ResourceRef
                        {
                            UiDisplayName = c.DisplayName,
                            UniversalId = UniversalIdPrefix + c.TermPath
                        }
                    };
                })
            };

            var subsequent = timeline.Subsequent.Select((sub, i) =>
            {
                return new SubPanelDTO
                {
                    IncludeSubPanel = sub.ConceptGroup.NMustBeTrue > 0,
                    Index = i + 1,
                    MinimumCount = sub.ConceptGroup.NMustBeTrue,
                    JoinSequence = new SubPanelJoinSequence
                    {
                        Increment = sub.TimeConstraint != null ? sub.TimeConstraint.Value : -1,
                        DateIncrementType = DateIncrementType.Day, // FIX
                        SequenceType = SequenceType.AnytimeFollowing
                    },
                    PanelIndex = i,
                    PanelItems = sub.ConceptGroup.Concepts.Possibilities.Select((c, j) =>
                    {
                        return new PanelItemDTO
                        {
                            Index = j,
                            SubPanelIndex = 0,
                            PanelIndex = i,
                            Resource = new ResourceRef
                            {
                                UiDisplayName = c.DisplayName,
                                UniversalId = UniversalIdPrefix + c.TermPath
                            }
                        };
                    })
                };
            });

            return new PanelDTO
            {
                IncludePanel = timeline.Concepts.NMustBeTrue > 0,
                Index = i,
                Domain = PanelDomain.Panel,
                DateFilter = timeline.StartDate.HasValue ?
                        new DateBoundary
                        {
                            Start = new DateFilter { Date = timeline.StartDate.Value },
                            End = new DateFilter { Date = timeline.EndDate.Value }
                        }
                        : null,
                SubPanels = new List<SubPanelDTO>() { first }.Union(subsequent)
            };
        }

        public ShrineQuery ToShrineQuery(IPatientCountQueryDTO leafQuery)
        {
            var panels = leafQuery.All();

            return new ShrineQuery
            {
                Id = GenerateRandomLongId(),
                VersionInfo = new ShrineVersionInfo
                {
                    ProtocolVersion = 2,
                    ShrineVersion = "4.1.0-SNAPSHOT",
                    ItemVersion = 2,
                    CreateDate = DateTime.Now,
                    ChangeDate = DateTime.Now
                },
                Status = new ShrineStatus
                {
                    EncodedClass = ShrineStatusType.SentToHub
                },
                QueryDefinition = new ShrineQueryDefinition
                {
                    Expression = new ShrineConjunction
                    {
                        NMustBeTrue = panels.Count(),
                        Compare = new ShrineConjunctionCompare
                        {
                            EncodedClass = ShrineConjunctionComparison.AtLeast
                        },
                        Possibilities = panels.Select(p =>
                        {
                            var subpanel = p.SubPanels.First();

                            return new ShrineConceptGroup
                            {
                                Concepts = new ShrineConceptConjunction
                                {
                                    NMustBeTrue = p.IncludePanel ? 1 : 0,
                                    Compare = new ShrineConjunctionCompare
                                    {
                                        EncodedClass = p.IncludePanel ? ShrineConjunctionComparison.AtLeast : ShrineConjunctionComparison.AtMost,
                                    },
                                    Possibilities = subpanel.PanelItems.Select(pi =>
                                    {
                                        return new ShrineConcept
                                        {
                                            DisplayName = pi.Resource.UiDisplayName,
                                            TermPath = pi.Resource.UniversalId.ToString().Replace(UniversalIdPrefix, ""),
                                            Constraint = null
                                        };
                                    }),
                                    StartDate = p.DateFilter?.Start?.Date,
                                    EndDate = p.DateFilter?.End?.Date,
                                    OccursAtLeast = p.IncludePanel ? subpanel.MinimumCount : 0
                                }
                            };
                        })
                    }
                }
            };
        }

        public static long GenerateRandomLongId()
        {
            return LongRandom(10000000000000000, 999999999999999999, new Random());
        }

        static long LongRandom(long min, long max, Random rand)
        {
            long result = rand.Next((int)(min >> 32), (int)(max >> 32));
            result <<= 32;
            result |= (long)rand.Next((int)min, (int)max);
            return result;
        }
    }
}

