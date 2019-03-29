// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Tagging;
using Model.Extensions;

/*
 * Determines the rules for bucketing embedded panel item resources.
 */

namespace Model.Compiler
{
    public class ResourceRefs
    {
        public IEnumerable<ConceptRef> Concepts { get; set; } = new List<ConceptRef>();
        public IEnumerable<QueryRef> Queries { get; set; } = new List<QueryRef>();

        public ResourceRefs()
        {

        }

        public ResourceRefs(IEnumerable<ResourceRef> refs)
        {
            var concepts = new List<ConceptRef>();
            var queries = new List<QueryRef>();

            foreach (var res in refs)
            {
                if (!res.UseUniversalId())
                {
                    concepts.Add(new ConceptRef(res.Id.Value.ToString()));
                    continue;
                }
                if (!Urn.TryParse(res.UniversalId, out var urn))
                {
                    throw new FormatException($"{res.UniversalId} is not mapped to an embeddable resource");
                }
                switch (urn)
                {
                    case ConceptUrn concept:
                        concepts.Add(new ConceptRef { UniversalId = concept, Id = res.Id });
                        break;
                    case QueryUrn query:
                        queries.Add(new QueryRef { UniversalId = query, Id = res.Id });
                        break;
                }
            }

            Concepts = concepts;
            Queries = queries;
        }
    }

    public class ResourceRef
    {
        public Guid? Id { get; set; }
        public string UniversalId { get; set; }
        public string UiDisplayName { get; set; }

        public bool UseUniversalId() => !string.IsNullOrWhiteSpace(UniversalId);

        public ResourceRef() { }
    }

    public class ResourceRefEqualityComparer : IEqualityComparer<ResourceRef>
    {
        public bool Equals(ResourceRef x, ResourceRef y)
        {
            if (x == null && y == null) return true;
            if (x == null || y == null) return false;
            return GetHashCode(x) == GetHashCode(y);
        }

        public int GetHashCode(ResourceRef @ref)
        {
            if (@ref.UseUniversalId())
            {
                return @ref.UniversalId.GetConsistentHashCode();
            }
            return @ref.Id.Value.GetHashCode();
        }
    }
}
