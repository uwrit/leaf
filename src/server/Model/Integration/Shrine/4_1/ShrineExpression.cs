// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Compiler;

namespace Model.Integration.Shrine4_1
{
	public class ShrineQueryDefinition
	{
		public ShrineConjunction Expression { get; set; }
    }

	public abstract class ShrineExpression
	{
		public int NMustBeTrue { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? OccursAtLeast { get; set; }
        public ShrineConjunction Concepts { get; set; }
        public ShrineConjunctionCompare Compare { get; set; } = new ShrineConjunctionCompare();
	}

	public abstract class ShrineGroup : ShrineExpression
	{

	}

	public class ShrineConjunction : ShrineExpression
	{
		public IEnumerable<ShrineConceptGroupOrTimeline> Possibilities { get; set; } = new List<ShrineConceptGroupOrTimeline>();
	}

    public class ShrineConceptGroupOrTimeline : ShrineConceptGroup
    {
        public ShrineConceptGroup First { get; set; }
        public IEnumerable<ShrineTimelineSubsequentEvent> Subsequent { get; set; } = new List<ShrineTimelineSubsequentEvent>();

        public bool IsConceptGroup => First == null;
        public bool IsTimeline => First != null;
    }

    public class ShrineTimelineSubsequentEvent
    {
        public ShrineConceptGroup ConceptGroup { get; set; }
        public ShrineOccurrence PreviousOccurrence { get; set; }
        public ShrineOccurrence ThisOccurrence { get; set; }
        public ShrineTimelineSubsequentEventTimeConstraint TimeConstraint { get; set; }

        public ShrineTimelineSubsequentEvent() { }
    }

    public class ShrineTimelineSubsequentEventTimeConstraint
    {
        public NumericFilterType Operator { get; set; }
        public DateIncrementType TimeUnit { get; set; }
        public int Value { get; set; }
    }

    public class ShrineConceptConjunction : ShrineExpression
	{
		public IEnumerable<ShrineConcept> Possibilities { get; set; } = new List<ShrineConcept>();
	}

    public class ShrineConceptGroup : ShrineGroup
	{
		public new ShrineConceptConjunction Concepts { get; set; }
    }

	public class ShrineTimelineGroup : ShrineGroup
	{
		public ShrineConceptGroup ConceptGroup { get; set; }

    }

	public class ShrineTimeline : ShrineGroup
	{
		public ShrineConceptGroup First { get; set; }
		public IEnumerable<int> Subsequent { get; set; }
    }

	public class ShrineConcept : ShrineExpression
    {
		public string DisplayName { get; set; }
		public string TermPath { get; set; }
		public ShrineConceptConstraint Constraint { get; set; }
	}

	public class ShrineConceptConstraint
	{
		public NumericFilterType Operator { get; set; }
		public decimal? Value { get; set; }
        public decimal? Value1 { get; set; }
        public decimal? Value2 { get; set; }
        public string Unit { get; set; }
	}

	public class ShrineConjunctionCompare
	{
		public ShrineConjunctionComparison EncodedClass { get; set; } = ShrineConjunctionComparison.AtLeast;
	}

	public enum ShrineConjunctionComparison
	{
		AtLeast,
		Exactly,
		AtMost
	}

	public enum ShrineOccurrence
	{
		Any,
		First
	}
}

