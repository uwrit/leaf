// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Model.Compiler;
using Model.Integration.Shrine4_1;

namespace API.DTO.Integration.Shrine4_1
{
    public class ShrineQueryDefinitionDTO
    {
        public ShrineConjunctionDTO Expression { get; set; }

        public ShrineQueryDefinitionDTO() { }

        public ShrineQueryDefinitionDTO(ShrineQueryDefinition definition)
        {
            Expression = new ShrineConjunctionDTO(definition.Expression);
        }
    }

    public class ShrineAnonymousEncodedClassDTO
    {
        public string EncodedClass { get; set; }

        public ShrineAnonymousEncodedClassDTO() { }

        public ShrineAnonymousEncodedClassDTO(string encodedClass)
        {
            EncodedClass = encodedClass;
        }
    }

    public abstract class ShrineGroupDTO : ShrineAnonymousEncodedClassDTO
    {
        public int NMustBeTrue { get; set; }
        public ShrineConjunctionCompareDTO Compare { get; set; }

        public ShrineGroupDTO() { }

        public ShrineGroupDTO(ShrineGroup expr)
        {
            NMustBeTrue = expr.NMustBeTrue;
            Compare = new ShrineConjunctionCompareDTO(expr.Compare);
        }
    }

    public class ShrineConjunctionDTO : ShrineAnonymousEncodedClassDTO
    {
        public int NMustBeTrue { get; set; }
        public ShrineConjunctionCompareDTO Compare { get; set; }
        public IEnumerable<ShrineConceptGroupOrTimelineDTO> Possibilities { get; set; }

        public ShrineConjunctionDTO()
        {
            EncodedClass = "Conjunction";
        }

        public ShrineConjunctionDTO(ShrineConjunction conjunction)
        {
            EncodedClass = "Conjunction";
            Possibilities = conjunction.Possibilities.Select(p => new ShrineConceptGroupOrTimelineDTO(p));
        }
    }

    public class ShrineConceptGroupOrTimelineDTO : ShrineConceptGroupDTO
    {
        public ShrineConceptGroupDTO First { get; set; }
        public IEnumerable<ShrineTimelineSubsequentEventDTO> Subsequent { get; set; } = new List<ShrineTimelineSubsequentEventDTO>();

        public bool IsConceptGroup => First == null;
        public bool IsTimeline => First != null;

        public ShrineConceptGroupOrTimelineDTO() { }

        public ShrineConceptGroupOrTimelineDTO(ShrineConceptGroupOrTimeline cg)
        {
            if (cg.IsConceptGroup)
            {
                Concepts = new ShrineConceptConjunctionDTO(cg.Concepts);
                EncodedClass = "ConceptGroup";
            }
            else
            {
                First = new ShrineConceptGroupDTO(cg.First);
                Subsequent = cg.Subsequent.Select(s => new ShrineTimelineSubsequentEventDTO(s));
                EncodedClass = "Timeline";
            }
        }
    }

    public class ShrineTimelineSubsequentEventDTO
    {
        public ShrineConceptGroupDTO ConceptGroup { get; set; }
        public ShrineAnonymousEncodedClassDTO PreviousOccurrence { get; set; }
        public ShrineAnonymousEncodedClassDTO ThisOccurrence { get; set; }
        public ShrineTimelineSubsequentEventTimeConstraintDTO TimeConstraint { get; set; }

        public ShrineTimelineSubsequentEventDTO() { }

        public ShrineTimelineSubsequentEventDTO(ShrineTimelineSubsequentEvent sub)
        {
            ConceptGroup = new ShrineConceptGroupDTO(sub.ConceptGroup);
            PreviousOccurrence = new ShrineAnonymousEncodedClassDTO(sub.PreviousOccurrence.ToString());
            ThisOccurrence = new ShrineAnonymousEncodedClassDTO(sub.ThisOccurrence.ToString());
            TimeConstraint = sub.TimeConstraint != null ? new ShrineTimelineSubsequentEventTimeConstraintDTO(sub.TimeConstraint) : null;
        }
    }

    public class ShrineTimelineSubsequentEventTimeConstraintDTO
    {
        public ShrineAnonymousEncodedClassDTO Operator { get; set; }
        public ShrineAnonymousEncodedClassDTO TimeUnit { get; set; }
        public int Value { get; set; }

        public ShrineTimelineSubsequentEventTimeConstraintDTO() { }

        public ShrineTimelineSubsequentEventTimeConstraintDTO(ShrineTimelineSubsequentEventTimeConstraint timeConstraint)
        {
            Operator = new ShrineAnonymousEncodedClassDTO(timeConstraint.Operator.ToString());
            TimeUnit = new ShrineAnonymousEncodedClassDTO(timeConstraint.TimeUnit.ToString());
            Value = timeConstraint.Value;
        }
    }

    public class ShrineConceptGroupDTO : ShrineGroupDTO
    {
        public long? StartDate { get; set; }
        public long? EndDate { get; set; }
        public int OccursAtLeast { get; set; } = 1;
        public ShrineConceptConjunctionDTO Concepts { get; set; }

        public ShrineConceptGroupDTO() { }

        public ShrineConceptGroupDTO(ShrineConceptGroup group) : base(group)
        {
            StartDate = group.StartDate != null ? ((DateTimeOffset)group.StartDate).ToUnixTimeMilliseconds() : null;
            EndDate = group.EndDate != null ? ((DateTimeOffset)group.EndDate).ToUnixTimeMilliseconds() : null;
            OccursAtLeast = group.OccursAtLeast.HasValue ? (int)group.OccursAtLeast : 1;
            Concepts = new ShrineConceptConjunctionDTO(group.Concepts);
        }
    }

    public class ShrineConceptConjunctionDTO : ShrineAnonymousEncodedClassDTO
    {
        public int NMustBeTrue { get; set; }
        public ShrineConjunctionCompareDTO Compare { get; set; }
        public IEnumerable<ShrineConceptDTO> Possibilities { get; set; }

        public ShrineConceptConjunctionDTO() { }

        public ShrineConceptConjunctionDTO(ShrineConceptConjunction conjunction)
        {
            NMustBeTrue = conjunction.NMustBeTrue;
            Compare = new ShrineConjunctionCompareDTO(conjunction.Compare);
            Possibilities = conjunction.Possibilities.Select(p => new ShrineConceptDTO(p));
        }
    }

    public class ShrineConceptDTO
    {
        public string DisplayName { get; set; }
        public string TermPath { get; set; }
        public string Constraint { get; set; }
        public static readonly string EncodedClass = "Concept";

        public ShrineConceptDTO() { }

        public ShrineConceptDTO(ShrineConcept concept)
        {
            DisplayName = concept.DisplayName;
            TermPath = concept.TermPath;
            Constraint = concept.Constraint;
        }
    }

    public class ShrineConjunctionCompareDTO : ShrineAnonymousEncodedClassDTO
    {
        public ShrineConjunctionCompareDTO() { }

        public ShrineConjunctionCompareDTO(ShrineConjunctionCompare compare)
        {
            EncodedClass = compare.EncodedClass.ToString();
        }
    }

    public static class ShrineQueryDefinitionExtensions
    {
        public static ShrineConjunctionCompare ToCompare(this ShrineConjunctionCompareDTO dto)
        {
            _ = Enum.TryParse(dto.EncodedClass, out ShrineConjunctionComparison encodedClass);
            return new ShrineConjunctionCompare
            {
                EncodedClass = encodedClass
            };
        }

        public static ShrineConcept ToConcept(this ShrineConceptDTO dto)
        {
            return new ShrineConcept
            {
                DisplayName = dto.DisplayName,
                TermPath = dto.TermPath,
                Constraint = dto.Constraint
            };
        }

        public static ShrineConceptGroup ToConceptGroup(this ShrineConceptGroupDTO dto)
        {
            return new ShrineConceptGroup
            {
                StartDate = dto.StartDate != null ? DateTimeOffset.FromUnixTimeMilliseconds((long)dto.StartDate).UtcDateTime : null,
                EndDate = dto.EndDate != null ? DateTimeOffset.FromUnixTimeMilliseconds((long)dto.EndDate).UtcDateTime : null,
                OccursAtLeast = dto.OccursAtLeast,
                Concepts = dto.Concepts.ToConjunction()
            };
        }

        public static ShrineConceptGroupOrTimeline ToConceptGroupOrTimeline(this ShrineConceptGroupOrTimelineDTO dto)
        {
            return new ShrineConceptGroupOrTimeline
            {
                StartDate = dto.StartDate != null ? DateTimeOffset.FromUnixTimeMilliseconds((long)dto.StartDate).UtcDateTime : null,
                EndDate = dto.EndDate != null ? DateTimeOffset.FromUnixTimeMilliseconds((long)dto.EndDate).UtcDateTime : null,
                OccursAtLeast = dto.OccursAtLeast,
                Concepts = dto.IsConceptGroup ? dto.Concepts.ToConjunction() : null,
                First = dto.IsTimeline ? dto.First.ToConceptGroup() : null,
                Subsequent = dto.IsTimeline ? dto.Subsequent.Select(s => s.ToSubsequentEvent()) : null
            };
        }

        public static ShrineConjunction ToConjunction(this ShrineConjunctionDTO dto)
        {
            return new ShrineConjunction
            {
                NMustBeTrue = dto.NMustBeTrue,
                Compare = dto.Compare.ToCompare(),
                Possibilities = dto.Possibilities.Select(p => p.ToConceptGroupOrTimeline())
            };
        }

        public static ShrineTimelineSubsequentEvent ToSubsequentEvent(this ShrineTimelineSubsequentEventDTO dto)
        {
            _ = Enum.TryParse(dto.PreviousOccurrence.EncodedClass, out ShrineOccurrence previousOccurrence);
            _ = Enum.TryParse(dto.ThisOccurrence.EncodedClass, out ShrineOccurrence thisOccurrence);

            return new ShrineTimelineSubsequentEvent
            {
                ConceptGroup = dto.ConceptGroup.ToConceptGroup(),
                PreviousOccurrence = previousOccurrence,
                ThisOccurrence = thisOccurrence,
                TimeConstraint = dto.TimeConstraint != null ? dto.TimeConstraint.ToTimeConstraint() : null
            };
        }

        public static ShrineTimelineSubsequentEventTimeConstraint ToTimeConstraint(this ShrineTimelineSubsequentEventTimeConstraintDTO dto)
        {
            _ = Enum.TryParse(dto.Operator.EncodedClass, out NumericFilterType op);
            _ = Enum.TryParse(dto.TimeUnit.EncodedClass, out DateIncrementType timeUnit);

            return new ShrineTimelineSubsequentEventTimeConstraint
            {
                Operator = op,
                TimeUnit = timeUnit,
                Value = dto.Value
            };
        }

        public static ShrineConceptConjunction ToConjunction(this ShrineConceptConjunctionDTO dto)
        {
            return new ShrineConceptConjunction
            {
                NMustBeTrue = dto.NMustBeTrue,
                Compare = dto.Compare.ToCompare(),
                Possibilities = dto.Possibilities.Select(p => p.ToConcept())
            };
        }


        public static ShrineQueryDefinition ToDefinition(this ShrineQueryDefinitionDTO dto)
        {
            return new ShrineQueryDefinition
            {
                Expression = dto.Expression.ToConjunction()
            };
        }
    }
}

