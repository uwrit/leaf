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
using Microsoft.Extensions.Options;
using Model.Compiler;
using Model.Integration.Shrine;
using Model.Integration.Shrine4_1;
using Model.Options;

namespace API.Integration.Shrine4_1
{
    public class ShrineQueryDefinitionConverter
    {
        readonly string UniversalIdPrefix = $"urn:leaf:concept:shrine:";
        readonly ShrineIntegrationOptions opts;

        public ShrineQueryDefinitionConverter(IOptions<ShrineIntegrationOptions> opts)
        {
            this.opts = opts.Value;
        }

        public IPatientCountQueryDTO ToLeafQuery(ShrineQuery shrineQuery)
        {
            var possibilities = shrineQuery.QueryDefinition.Expression.Possibilities;
            var panels = possibilities.Select((grp, i) => grp.IsConceptGroup
                ? ShrineConceptGroupToPanelDTO(grp, i)
                : ShrineTimelineToPanelDTO(grp, i)
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
                DateFilter = conceptGroup.StartDate.HasValue || conceptGroup.EndDate.HasValue ?
                        new DateBoundary
                        {
                            Start = new DateFilter { Date = conceptGroup.StartDate ?? new DateTime(1900, 1, 1), DateIncrementType = DateIncrementType.Specific },
                            End = new DateFilter { Date = conceptGroup.EndDate ?? DateTime.Now, DateIncrementType = DateIncrementType.Specific }
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
                                    NumericFilter = c?.Constraint != null && c?.Constraint?.Operator != NumericFilterType.None
                                        ? new NumericFilter
                                        {
                                            FilterType = c.Constraint.Operator,
                                            Filter = c.Constraint.Value.HasValue
                                                ? new decimal[] { (decimal)c.Constraint.Value }
                                                : new decimal[] { (decimal)c.Constraint.Value1, (decimal)c.Constraint.Value2 } 
                                        }
                                        : null,
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
                IncludeSubPanel = timeline.First.Concepts.NMustBeTrue > 0,
                Index = 0,
                MinimumCount = timeline.First.Concepts.NMustBeTrue,
                PanelIndex = i,
                PanelItems = timeline.First.Concepts.Possibilities.Select((c, j) =>
                {
                    return new PanelItemDTO
                    {
                        Index = j,
                        SubPanelIndex = 0,
                        PanelIndex = i,
                        RecencyFilter = timeline.Subsequent.First().PreviousOccurrence == ShrineOccurrence.First
                            ? RecencyFilterType.Min
                            : RecencyFilterType.None,
                        NumericFilter = c?.Constraint != null && c?.Constraint?.Operator != NumericFilterType.None
                            ? new NumericFilter
                            {
                                FilterType = c.Constraint.Operator,
                                Filter = c.Constraint.Value.HasValue
                                    ? new decimal[] { (decimal)c.Constraint.Value }
                                    : new decimal[] { (decimal)c.Constraint.Value1, (decimal)c.Constraint.Value2 }
                            }
                            : null,
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
                    MinimumCount = (int)sub.ConceptGroup.OccursAtLeast,
                    JoinSequence = new SubPanelJoinSequence
                    {
                        Increment = sub.TimeConstraint != null ? sub.TimeConstraint.Value : -1,
                        DateIncrementType = sub.TimeConstraint != null ? sub.TimeConstraint.TimeUnit : DateIncrementType.None,
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
                            RecencyFilter = sub.ThisOccurrence == ShrineOccurrence.First
                                ? RecencyFilterType.Min
                                : RecencyFilterType.None,
                            NumericFilter = c?.Constraint != null && c?.Constraint?.Operator != NumericFilterType.None
                                ? new NumericFilter
                                {
                                    FilterType = c.Constraint.Operator,
                                    Filter = c.Constraint.Value.HasValue
                                        ? new decimal[] { (decimal)c.Constraint.Value }
                                        : new decimal[] { (decimal)c.Constraint.Value1, (decimal)c.Constraint.Value2 }
                                }
                                : null,
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
                IncludePanel = timeline.First.Concepts.NMustBeTrue > 0,
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
                Status = ShrineStatusType.SentToHub,
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
                            return p.SubPanels.Count() > 1 && p.SubPanels.ElementAt(1).PanelItems.Any()
                                ? LeafNonSequenceToShrineConceptGroup(p)
                                : LeafSequenceToShrineTimeline(p);
                        })
                    }
                },
                Output = ShrineOutputType.Count,
                QueryName = "Query"
            };
        }

        ShrineConceptGroupOrTimeline LeafNonSequenceToShrineConceptGroup(IPanelDTO panel)
        {
            var subpanel = panel.SubPanels.First();

            return new ShrineConceptGroupOrTimeline
            {
                Concepts = LeafSubPanelToShrineConceptConjunction(panel, subpanel)
            };
        }

        ShrineConceptGroupOrTimeline LeafSequenceToShrineTimeline(IPanelDTO panel)
        {
            var firstSubpanel = panel.SubPanels.First();
            var first = new ShrineConceptGroup
            {
                Concepts = LeafSubPanelToShrineConceptConjunction(panel, firstSubpanel)
            };

            var subsequent = panel.SubPanels.Skip(1).Select(subpanel =>
            {
                return new ShrineTimelineSubsequentEvent
                {
                    ConceptGroup = new ShrineConceptGroup
                    {
                        Concepts = LeafSubPanelToShrineConceptConjunction(panel, subpanel)
                    },
                    PreviousOccurrence = ShrineOccurrence.Any,
                    ThisOccurrence = ShrineOccurrence.Any,
                    TimeConstraint = subpanel.JoinSequence.SequenceType == SequenceType.WithinFollowing
                        ? new ShrineTimelineSubsequentEventTimeConstraint
                        {
                            Operator = NumericFilterType.LessThanOrEqual,
                            TimeUnit = subpanel.JoinSequence.DateIncrementType,
                            Value = subpanel.JoinSequence.Increment
                        }
                        : null
                };
            });

            return new ShrineConceptGroupOrTimeline
            {
                First = first,
                Subsequent = subsequent
            };
        }

        ShrineConceptConjunction LeafSubPanelToShrineConceptConjunction(IPanelDTO panel, ISubPanelDTO subpanel)
        {
            return new ShrineConceptConjunction
            {
                NMustBeTrue = panel.IncludePanel ? 1 : 0,
                Compare = new ShrineConjunctionCompare
                {
                    EncodedClass = panel.IncludePanel ? ShrineConjunctionComparison.AtLeast : ShrineConjunctionComparison.AtMost,
                },
                Possibilities = subpanel.PanelItems.Select(pi =>
                {
                    return new ShrineConcept
                    {
                        DisplayName = pi.Resource.UiDisplayName,
                        TermPath = pi.Resource.UniversalId.ToString().Replace(UniversalIdPrefix, ""),
                        Constraint = pi.NumericFilter != null && pi.NumericFilter.FilterType != NumericFilterType.None
                            ? new ShrineConceptConstraint
                            {
                                Operator = pi.NumericFilter.FilterType,
                                Value =  pi.NumericFilter.FilterType != NumericFilterType.Between ? pi.NumericFilter.Filter.First() : null,
                                Value1 = pi.NumericFilter.FilterType == NumericFilterType.Between ? pi.NumericFilter.Filter.First() : null,
                                Value2 = pi.NumericFilter.FilterType == NumericFilterType.Between ? pi.NumericFilter.Filter.Last()  : null
                            }
                            : null
                    };
                }),
                StartDate = panel.DateFilter?.Start?.Date,
                EndDate = panel.DateFilter?.End?.Date,
                OccursAtLeast = panel.IncludePanel ? subpanel.MinimumCount : 0
            };
    }

        public static long GenerateRandomLongId()
        {
            //return LongRandom(10000000000000000, long.MaxValue, new Random());
            Random random = new();
            byte[] bytes = new byte[8];
            random.NextBytes(bytes);
            return BitConverter.ToInt64(bytes, 0);
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

