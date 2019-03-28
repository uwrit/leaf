// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Xunit;
using Services.Cohort;
using Model.Cohort;
using System.Collections.Generic;
using System.Linq;

namespace Tests
{
    public class PatientCountAggregatorTests
    {
        [Fact]
        public void Single_Include_Only_Should_Equal_Output()
        {
            var context = new PartialPatientCountContext[]
            {
                new PartialPatientCountContext
                {
                    PatientIds = new HashSet<string>
                    {
                        "123", "234", "345", "456"
                    },
                    IsInclusionCriteria = true
                }
            };

            var agg = new PatientCountAggregator().Aggregate(context);

            Assert.True(agg.SequenceEqual(context.ElementAt(0).PatientIds));
        }

        [Fact]
        public void Complex_Context_Aggregates_Correctly()
        {
            var context = new PartialPatientCountContext[]
            {
                new PartialPatientCountContext
                {
                    PatientIds = new HashSet<string>
                    {
                        "123", "234", "345", "456"
                    },
                    IsInclusionCriteria = true
                },
                new PartialPatientCountContext
                {
                    PatientIds = new HashSet<string>
                    {
                        "234", "345", "456"
                    },
                    IsInclusionCriteria = true
                },
                new PartialPatientCountContext
                {
                    PatientIds = new HashSet<string>
                    {
                        "456"
                    },
                    IsInclusionCriteria = false
                }
            };

            var expected = new string[] { "234", "345" };

            var agg = new PatientCountAggregator().Aggregate(context);

            Assert.True(expected.SequenceEqual(agg));
        }
    }
}
