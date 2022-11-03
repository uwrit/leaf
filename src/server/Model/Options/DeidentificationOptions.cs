// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;

namespace Model.Options
{
    public class DeidentificationOptions
    {
        public PatientOptions Patient = new PatientOptions();
        public CohortObfuscationOptions Cohort = new CohortObfuscationOptions();

        public bool ObfuscateCohort => Cohort.Enabled;

        public class PatientOptions
        {
            public bool Enabled { get; set; }
            public DateShiftOptions DateShifting = new DateShiftOptions();

            public class DateShiftOptions
            {
                const string Minute = @"MINUTE";
                const string Hour = @"HOUR";
                const string Day = @"DAY";

                public DateShiftIncrement Increment { get; set; }
                public int LowerBound { get; set; }
                public int UpperBound { get; set; }

                public static readonly IEnumerable<string> ValidDateShifts = new string[] { Minute, Hour, Day };

                bool ValidDateShift(string value) => ValidDateShifts.Contains(value);

                public DateShiftOptions WithIncrement(string value)
                {
                    var tmp = value.ToUpper();
                    if (!ValidDateShift(tmp))
                    {
                        throw new LeafConfigurationException($"{value} is not a supported a dateshift increment");
                    }

                    switch (tmp)
                    {
                        case Minute:
                            Increment = DateShiftIncrement.Minute;
                            break;
                        case Hour:
                            Increment = DateShiftIncrement.Hour;
                            break;
                        case Day:
                            Increment = DateShiftIncrement.Day;
                            break;
                    }

                    return this;
                }
            }

            public enum DateShiftIncrement : ushort
            {
                Minute = 1,
                Hour = 2,
                Day = 3
            }
        }

        public class CohortObfuscationOptions
        {
            public bool Enabled { get; set; }
            public NoiseOptions Noise = new NoiseOptions();
            public LowCellSizeMaskingOptions LowCellSizeMasking = new LowCellSizeMaskingOptions();

            public class NoiseOptions
            {
                public bool Enabled { get; set; }
                public int LowerBound { get; set; }
                public int UpperBound { get; set; }
            }

            public class LowCellSizeMaskingOptions
            {
                public bool Enabled { get; set; }
                public int Threshold { get; set; }
            }
        }
    }
}
