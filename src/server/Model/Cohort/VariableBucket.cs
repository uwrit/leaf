// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Cohort
{
    public class VariableBucketSet
    {
        public DistributionData<VariableBucket> Data { get; set; }
        public Dictionary<string,int> SubBucketTotals { get; set; }

        public VariableBucketSet()
        {
            Data = new DistributionData<VariableBucket>();
            SubBucketTotals = new Dictionary<string, int>();
        }

        VariableBucket IncrementKey(string key)
        {
            var k = key.ToLowerInvariant();
            if (Data.Buckets.ContainsKey(k))
            {
                return Data.GetBucket(k);
            }
            else
            {
                return Data.AddBucket(k);
            }
        }

        void IncrementSubkey(VariableBucket bucket, string subkey)
        {
            var sk = subkey.ToLowerInvariant();
            if (bucket.SubBuckets.ContainsKey(sk))
            {
                bucket.SubBuckets[sk]++;
            }
            else
            {
                bucket.SubBuckets.Add(sk, 1);
            }
        }

        void IncrementSummary(string subkey)
        {
            var sk = subkey.ToLowerInvariant();
            if (SubBucketTotals.ContainsKey(sk))
            {
                SubBucketTotals[sk]++;
            }
            else
            {
                SubBucketTotals.Add(sk, 1);
            }
        }

        public void Increment(string key)
        {
            Increment(key, key);
        }

        public void Increment(string key, string subkey)
        {
            var bucket = IncrementKey(key);
            IncrementSubkey(bucket, subkey);
            IncrementSummary(subkey);
        }
    }

    public class VariableBucket
    {
        public Dictionary<string, int> SubBuckets = new Dictionary<string, int>();
    }
}
