// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using Model.Cohort;

namespace Model.Cohort
{
    public class PatientCountAggregator
    {
        public HashSet<string> Aggregate(IReadOnlyCollection<PartialPatientCountContext> partials)
        {
            HashSet<string> reducer(HashSet<string> accum, HashSet<string> current)
            {
                accum.IntersectWith(current);
                return accum;
            }

            var diffed = GetDifferentiatedContexts(partials);

            var agg = diffed.Include
                            .Skip(1)
                            .Aggregate(diffed.Include[0], reducer);

            agg.ExceptWith(diffed.Exclude);

            return agg;
        }

        DifferentiatedPatientCountContext GetDifferentiatedContexts(IReadOnlyCollection<PartialPatientCountContext> partials)
        {
            var inclusion = new List<HashSet<string>>();
            var exclusion = new HashSet<string>();

            foreach (var partial in partials)
            {
                if (partial.IsInclusionCriteria)
                {
                    inclusion.Add(partial.PatientIds);
                    continue;
                }
                exclusion.UnionWith(partial.PatientIds);
            }

            return new DifferentiatedPatientCountContext
            {
                Include = inclusion,
                Exclude = exclusion
            };
        }
    }

    class DifferentiatedPatientCountContext
    {
        public List<HashSet<string>> Include { get; set; }
        public HashSet<string> Exclude { get; set; }

        public DifferentiatedPatientCountContext()
        {
            Include = new List<HashSet<string>>();
            Exclude = new HashSet<string>();
        }
    }
}
