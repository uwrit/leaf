// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Extensions;

namespace Model.Tagging
{
    public class ConceptUrn : Urn
    {
        const string resourceSegment = ResourceType.Concept;

        ConceptUrn(string urn) : base(urn)
        {

        }

        ConceptUrn() { }

        public static ConceptUrn From(string urn)
        {
            if (string.IsNullOrWhiteSpace(urn))
            {
                return null;
            }
            if (!IsValid(urn, resourceSegment))
            {
                throw new FormatException($"{urn} is not valid, {nameof(ConceptUrn)}s must start with {prefix}{resourceSegment}");
            }
            return new ConceptUrn(urn);
        }

        public static bool TryParse(string input, out ConceptUrn urn)
        {
            urn = default;
            if (string.IsNullOrWhiteSpace(input))
            {
                return false;
            }
            if (!IsValid(input, resourceSegment))
            {
                return false;
            }
            urn = new ConceptUrn(input);
            return true;
        }

        internal static bool TryParseUrn(string input, out Urn urn)
        {
            var ok = TryParse(input, out var conceptUrn);
            urn = conceptUrn;
            return ok;
        }
    }

    public class ConceptUrnEqualityComparer : IEqualityComparer<ConceptUrn>
    {
        UrnEqualityComparer urnEqual = new UrnEqualityComparer();

        public bool Equals(ConceptUrn x, ConceptUrn y)
        {
            return urnEqual.Equals(x, y);
        }

        public int GetHashCode(ConceptUrn obj)
        {
            return urnEqual.GetHashCode(obj);
        }
    }
}
