// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Model.Cohort;
using System.Collections.Generic;

namespace Services.Cohort
{
    // TODO(cspital) move to model
    public class DemographicAggregator
    {
        const string Female = "Female";
        const string Male = "Male";

        readonly BinarySplitPair GenderSplit = new BinarySplitPair
        {
            Category = "Gender",
            Left = new BinarySplit { Label = Female, Value = 0 },
            Right = new BinarySplit { Label = Male, Value = 0 }
        };

        readonly BinarySplitPair VitalSplit = new BinarySplitPair
        {
            Category = "VitalStatus",
            Left = new BinarySplit { Label = "Living", Value = 0 },
            Right = new BinarySplit { Label = "Deceased", Value = 0 }
        };

        readonly BinarySplitPair AARPSplit = new BinarySplitPair
        {
            Category = "AARP",
            Left = new BinarySplit { Label = "65 and Older", Value = 0 },
            Right = new BinarySplit { Label = "Under 65", Value = 0 }
        };

        readonly BinarySplitPair HispanicSplit = new BinarySplitPair
        {
            Category = "Hispanic",
            Left = new BinarySplit { Label = "Hispanic", Value = 0 },
            Right = new BinarySplit { Label = "Not Hispanic", Value = 0 }
        };

        readonly BinarySplitPair MarriedSplit = new BinarySplitPair
        {
            Category = "Married",
            Left = new BinarySplit { Label = "Married", Value = 0 },
            Right = new BinarySplit { Label = "Not Married", Value = 0 }
        };

        readonly DistributionData<AgeByGenderBucket> AgeBreakdown = new DistributionData<AgeByGenderBucket>(ageBuckets);

        readonly IEnumerable<PatientDemographic> cohort;

        public DemographicAggregator(PatientDemographicContext context)
        {
            cohort = context.Cohort;
        }

        public DemographicAggregator(IEnumerable<PatientDemographic> patients)
        {
            cohort = patients;
        }

        public DemographicStatistics Aggregate()
        {
            foreach (var patient in cohort)
            {
                RecordGenderAgeAARP(patient);
                RecordVitalStatus(patient);
                RecordHispanic(patient);
                RecordMarried(patient);
            }

            return new DemographicStatistics
            {
                BinarySplitData = new List<BinarySplitPair> { GenderSplit, VitalSplit, AARPSplit, HispanicSplit, MarriedSplit },
                AgeByGenderData = AgeBreakdown
            };
        }

        readonly static string[] femaleSynonyms = { "f", "female" };
        readonly static string[] maleSynonyms = { "m", "male" };

        bool IsFemale(PatientDemographic patient)
        {
            return femaleSynonyms.Any(s => s.Equals(patient.Gender, StringComparison.InvariantCultureIgnoreCase));
        }

        bool IsMale(PatientDemographic patient)
        {
            return maleSynonyms.Any(s => s.Equals(patient.Gender, StringComparison.InvariantCultureIgnoreCase));
        }

        BinarySplit RecordVitalStatus(PatientDemographic patient)
        {
            if (!patient.IsDeceased.HasValue)
            {
                return null;
            }

            BinarySplit side = VitalSplit.Left;

            if (patient.IsDeceased.Value)
            {
                side = VitalSplit.Right;
            }

            side.Value++;
            return side;
        }

        BinarySplit RecordHispanic(PatientDemographic patient)
        {
            if (!patient.IsHispanic.HasValue)
            {
                return null;
            }

            BinarySplit side = HispanicSplit.Right;

            if (patient.IsHispanic.Value)
            {
                side = HispanicSplit.Left;
            }

            side.Value++;
            return side;
        }

        BinarySplit RecordMarried(PatientDemographic patient)
        {
            if (!patient.IsMarried.HasValue)
            {
                return null;
            }

            BinarySplit side = MarriedSplit.Right;

            if (patient.IsMarried.Value)
            {
                side = MarriedSplit.Left;
            }

            side.Value++;
            return side;
        }

        readonly static string[] ageBuckets = { "<1", "1-9", "10-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75-84", ">84" };
        readonly static KeyValuePair<Func<int, bool>, string>[] ageSwitch =
        {
            new KeyValuePair<Func<int, bool>, string>(x => x < 1, ageBuckets[0]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 1 && x <= 9, ageBuckets[1]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 10 && x <= 17, ageBuckets[2]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 18 && x <= 24, ageBuckets[3]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 25 && x <= 34, ageBuckets[4]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 35 && x <= 44, ageBuckets[5]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 45 && x <= 54, ageBuckets[6]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 55 && x <= 64, ageBuckets[7]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 65 && x <= 74, ageBuckets[8]),
            new KeyValuePair<Func<int, bool>, string>(x => x >= 75 && x <= 84, ageBuckets[9]),
            new KeyValuePair<Func<int, bool>, string>(x => x > 84, ageBuckets[10]),
        };

        AgeByGenderBucket AgeToBucket(int age)
        {
            var name = ageSwitch.First(sw => sw.Key(age)).Value;
            return AgeBreakdown.GetBucket(name);
        }

        void RecordGenderAgeAARP(PatientDemographic patient)
        {
            void aarp(int age)
            {
                if (age >= 65)
                {
                    AARPSplit.Left.Value++;
                }
                else
                {
                    AARPSplit.Right.Value++;
                }
            }

            BinarySplit gender = null;
            Action<AgeByGenderBucket> increment = (bucket) => { bucket.Others++; };
            if (IsFemale(patient))
            {
                gender = GenderSplit.Left;
                increment = (bucket) => { bucket.Females++; };
            }
            else if (IsMale(patient))
            {
                gender = GenderSplit.Right;
                increment = (bucket) => { bucket.Males++; };
            }

            var boxed = patient.Age;
            if (boxed.HasValue)
            {
                var age = boxed.Value;
                aarp(age);

                var bucket = AgeToBucket(age);
                increment(bucket);
            }

            if (gender != null)
            {
                gender.Value++;
            }
        }
    }
}
