// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Cohort
{
    public class DistributionData<T> where T : class, new()
    {
        public IDictionary<string, T> Buckets { get; set; }

        public DistributionData(params string[] buckets)
        {
            Buckets = new Dictionary<string, T>();
            foreach (var b in buckets)
            {
                Buckets.Add(b, new T());
            }
        }

        public T GetBucket(string bucket)
        {
            if (Buckets.TryGetValue(bucket, out var container))
            {
                return container;
            }
            return null;
        }
    }
}
