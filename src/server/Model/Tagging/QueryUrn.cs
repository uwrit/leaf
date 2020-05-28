// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Tagging
{
    public sealed class QueryUrn : Urn
    {
        const string resourceSegment = ResourceType.Query;

        QueryUrn(string urn) : base(urn)
        {

        }

        public static QueryUrn From(string urn)
        {
            if (string.IsNullOrWhiteSpace(urn))
            {
                return null;
            }
            if (!IsValid(urn, resourceSegment))
            {
                throw new FormatException($"{urn} is not valid, {nameof(QueryUrn)}s must start with {prefix}{resourceSegment}");
            }
            return new QueryUrn(urn);
        }

        public static bool TryParse(string input, out QueryUrn urn)
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
            urn = new QueryUrn(input);
            return true;
        }

        internal static bool TryParseUrn(string input, out Urn urn)
        {
            var ok = TryParse(input, out var queryUrn);
            urn = queryUrn;
            return ok;
        }

        public static QueryUrn Create(Guid guid)
        {
            var now = DateTime.UtcNow.Ticks.ToString();
            return From($"urn:leaf:query:{guid.ToString()}:{now}");
        }
    }
}
