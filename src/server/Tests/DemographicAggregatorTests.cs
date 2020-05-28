// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Cohort;
using Xunit;
using System.Collections.Generic;
using System.Linq;

namespace Tests
{
    public class DemographicAggregatorTests
    {
        static DemographicStatistics reduce(IEnumerable<PatientDemographic> patients)
        {
            return new DemographicAggregator(patients).Aggregate();
        }

        [Fact]
        public void Should_Only_Count_Binary_Gender_On_Match()
        {
            var patients = new PatientDemographic[]
            {
                new PatientDemographic
                {
                    Gender = "Nonbinary"
                },
                new PatientDemographic
                {
                    Gender = "female"
                },
                new PatientDemographic
                {
                    Gender = "female"
                },
                new PatientDemographic
                {
                    Gender = "male"
                }
            };
            var stats = reduce(patients);

            var gender = stats.BinarySplitData.First(b => b.Category == "Gender");
            var female = gender.Left;
            var male = gender.Right;

            Assert.True(male.Value == 1 && female.Value == 2);
        }

        [Fact]
        public void Should_Count_Married_On_Bool()
        {
            var patients = new PatientDemographic[]
            {
                new PatientDemographic
                {
                    IsMarried = false
                },
                new PatientDemographic
                {
                    IsMarried = false
                },
                new PatientDemographic
                {
                    IsMarried = false
                },
                new PatientDemographic
                {
                    IsMarried = true
                }
            };
            var stats = reduce(patients);

            var married = stats.BinarySplitData.First(b => b.Category == "Married");
            var yes = married.Left;
            var no = married.Right;

            Assert.True(yes.Value == 1 && no.Value == 3);
        }

        [Fact]
        public void Should_Count_Hispanic_On_Bool()
        {
            var patients = new PatientDemographic[]
            {
                new PatientDemographic
                {
                    IsHispanic = false
                },
                new PatientDemographic
                {
                    IsHispanic = false
                },
                new PatientDemographic
                {
                    IsHispanic = false
                },
                new PatientDemographic
                {
                    IsHispanic = true
                }
            };
            var stats = reduce(patients);

            var hispanic = stats.BinarySplitData.First(b => b.Category == "Hispanic");
            var yes = hispanic.Left;
            var no = hispanic.Right;

            Assert.True(yes.Value == 1 && no.Value == 3);
        }

        [Fact]
        public void Should_Only_Count_AARP_If_Aged()
        {
            var patients = new PatientDemographic[]
            {
                new PatientDemographic
                {
                    Age = 80
                },
                new PatientDemographic
                {

                },
                new PatientDemographic
                {
                    Age = 50
                },
                new PatientDemographic
                {
                    Age = 32
                }
            };

            var stats = reduce(patients);

            var aarp = stats.BinarySplitData.First(b => b.Category == "AARP");
            var yes = aarp.Left;
            var no = aarp.Right;

            Assert.True(yes.Value == 1 && no.Value == 2);
        }

        [Fact]
        public void Should_Only_GenderAgeBucket_If_Aged_All_NonBinary()
        {
            var patients = new PatientDemographic[]
            {
                new PatientDemographic
                {
                    Age = 80
                },
                new PatientDemographic
                {

                },
                new PatientDemographic
                {
                    Age = 50
                },
                new PatientDemographic
                {
                    Age = 48
                }
            };

            var stats = reduce(patients);

            var abg = stats.AgeByGenderData;
            var eighty = abg.GetBucket("75-84");
            var fifty = abg.GetBucket("45-54");

            Assert.Equal(1, eighty.Others);
            Assert.Equal(2, fifty.Others);
        }

        [Fact]
        public void Should_GenderAge_Ok()
        {
            var patients = new PatientDemographic[]
            {
                new PatientDemographic
                {
                    Age = 80,
                    Gender = "male"
                },
                new PatientDemographic
                {
                    Gender = "female"
                },
                new PatientDemographic
                {
                    Age = 50,
                    Gender = "female"
                },
                new PatientDemographic
                {
                    Age = 48,
                    Gender = "female"
                },
                new PatientDemographic
                {
                    Age = 48,
                    Gender = "male"
                }
            };

            var stats = reduce(patients);

            var abg = stats.AgeByGenderData;
            var eighty = abg.GetBucket("75-84");
            var fifty = abg.GetBucket("45-54");

            Assert.Equal(1, eighty.Males);
            Assert.Equal(1, fifty.Males);
            Assert.Equal(2, fifty.Females);
        }
    }
}