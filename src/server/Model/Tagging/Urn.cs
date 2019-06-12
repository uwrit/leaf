// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Extensions;

namespace Model.Tagging
{
    public abstract class Urn
    {
        protected const string prefix = "urn:leaf:";

        public string Value { get; protected set; }

        protected Urn(string urn)
        {
            Value = urn;
        }

        protected static bool IsValid(string input, string resourceSegment)
        {
            return input.StartsWith($"{prefix}{resourceSegment}", StringComparison.InvariantCultureIgnoreCase);
        }

        static string GetResourceSegment(string input)
        {
            var parts = input.Split(":", StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length < 3)
            {
                throw new FormatException($"Urn {input} is malformed");
            }
            return parts[2];
        }

        public override string ToString() => Value;

        public static bool TryParse(string value, out Urn urn)
        {
            urn = null;
            try
            {
                var resourceTag = GetResourceSegment(value);
                if (!resourceMap.TryGetValue(resourceTag, out var factory))
                {
                    return false;
                }
                var ok = factory(value, out var tmp);
                urn = tmp;
                return ok;
            }
            catch { return false; }
        }

        // defines which urn types can be generically determined and produced, currently driven by embedding requirements
        static readonly Dictionary<string, Factory> resourceMap = new Dictionary<string, Factory>
        {
            { ResourceType.Concept, ConceptUrn.TryParseUrn },
            { ResourceType.Query, QueryUrn.TryParseUrn },
        };

        delegate bool Factory(string value, out Urn urn);
    }

    public class UrnEqualityComparer : IEqualityComparer<Urn>
    {
        public bool Equals(Urn x, Urn y)
        {
            if (x == null && y == null) return true;
            if (x == null || y == null) return false;
            return x.ToString().Equals(y.ToString(), StringComparison.InvariantCultureIgnoreCase);
        }

        public int GetHashCode(Urn obj)
        {
            return obj.ToString().GetConsistentHashCode();
        }
    }
}
