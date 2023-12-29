// Copyright (c) 2023, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Model.Cohort;
using Model.Integration.Shrine;

namespace API.Integration.Shrine4_1
{ 
    public class ShrineDemographicsConverter
	{
		public ShrineBreakdown ToShrineBreakdown(DemographicProvider.Result result)
		{
			var stats = result.Demographics.Statistics;
			var leafGenders = stats.BinarySplitData.Where(bs => bs.Category == "Gender").First();
            var leafVitals = stats.BinarySplitData.Where(bs => bs.Category == "VitalStatus").First();
            var leafRaces = stats.NihRaceEthnicityData.EthnicBackgrounds;
			var leafAges = stats.AgeByGenderData.Buckets;

            object[][] gender =
			{
				new object[] { "Female", leafGenders.Left.Value },
				new object[] { "Male", leafGenders.Right.Value },
				new object[] { "Unknown", -1 }
			};

			object[][] races = leafRaces.Select(r => 
			{
				var h = r.Value.Hispanic;
				var n = r.Value.NotHispanic;
				var u = r.Value.Unknown;
				var sum = h.Females + h.Males + h.Others + n.Females + n.Males + n.Others + u.Females + u.Males + u.Others;
				return new object[] { Capitalize(r.Key), sum };
			}).ToArray();

			object[][] vitals =
			{
				new object[] { "Living", leafVitals.Left.Value },
				new object[] { "Deceased", leafVitals.Right.Value },
				new object[] { "Deferred", -1 },
				new object[] { "Not recorded", -1 }
			};

            // SHRINE uses slightly different age buckets, but we can avoid recalculating everything
			var zero        = leafAges.Where(a => a.Key == "<1" || a.Key == "1-9").Sum(a => a.Value.Females + a.Value.Males + a.Value.Others);
			var ten         = leafAges.Where(a => a.Key == "10-17").Sum(a => a.Value.Females + a.Value.Males + a.Value.Others);
            var eighteen    = leafAges.Where(a => a.Key == "18-24" || a.Key == "25-34").Sum(a => a.Value.Females + a.Value.Males + a.Value.Others);
            var thirtyfive  = leafAges.Where(a => a.Key == "35-44").Sum(a => a.Value.Females + a.Value.Males + a.Value.Others);
            var fortyfive   = leafAges.Where(a => a.Key == "45-54").Sum(a => a.Value.Females + a.Value.Males + a.Value.Others);
            var fiftyfive   = leafAges.Where(a => a.Key == "55-64").Sum(a => a.Value.Females + a.Value.Males + a.Value.Others);
            var sixtyfive   = leafAges.Where(a => a.Key == "65-74").Sum(a => a.Value.Females + a.Value.Males + a.Value.Others);
            var seventyfive = leafAges.Where(a => a.Key == "75-84").Sum(a => a.Value.Females + a.Value.Males + a.Value.Others);
            var eightyfive  = leafAges.Where(a => a.Key == ">84").Sum(a => a.Value.Females + a.Value.Males + a.Value.Others);
			var sixtyfiveplus = sixtyfive + seventyfive + eightyfive;

            object[][] ages =
            {
				// Note: the spaces are not a typo. SHRINE (I assume unintentionally?) has spaces before buckets,
				// so we have to match them to get viz to line up
                new object[] { "  0-9 years old",   CheckIfZero(zero) },
                new object[] { "  10-17 years old", CheckIfZero(ten) },
                new object[] { "  18-34 years old", CheckIfZero(eighteen) },
                new object[] { "  35-44 years old", CheckIfZero(thirtyfive) },
                new object[] { "  45-54 years old", CheckIfZero(fortyfive) },
                new object[] { "  55-64 years old", CheckIfZero(fiftyfive) },
                new object[] { "  65-74 years old", CheckIfZero(sixtyfive) },
                new object[] { "  75-84 years old", CheckIfZero(seventyfive) },
                new object[] { ">= 65 years old",   CheckIfZero(sixtyfiveplus) },
                new object[] { ">= 85 years old",   CheckIfZero(eightyfive) }
            };

            return new ShrineBreakdown
			{
				Counts = new object[]
				{
					new object[] { "PATIENT_GENDER_COUNT_XML", gender },
					new object[] { "PATIENT_RACE_COUNT_XML", races },
					new object[] { "PATIENT_VITALSTATUS_COUNT_XML", vitals },
					new object[] { "PATIENT_AGE_COUNT_XML", ages },
				}
			};
        }

		static int CheckIfZero(int value) => value == 0 ? -1 : value;

		static string Capitalize(string text) => char.ToUpper(text[0]) + text.Remove(0, 1);
    }
}

