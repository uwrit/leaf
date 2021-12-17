// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace API.Options
{
    public static partial class Config
    {
        public static class Deidentification
        {
            public const string Section = @"Deidentification";
            public const string Enabled = @"Deidentification:Enabled";

            public static class Patient
            {
                public const string Section = @"Deidentification:Patient";
                public const string Enabled = @"Deidentification:Patient:Enabled";

                public static class DateShifting
                {
                    public const string Section = @"Deidentification:Patient:DateShifting";
                    public const string Increment = @"Deidentification:Patient:DateShifting:Increment";
                    public const string LowerBound = @"Deidentification:Patient:DateShifting:LowerBound";
                    public const string UpperBound = @"Deidentification:Patient:DateShifting:UpperBound";
                }
            }
            public static class Cohort
            {
                public const string Section = @"Deidentification:Cohort";
                public const string Enabled = @"Deidentification:Cohort:Enabled";

                public static class Noise
                {
                    public const string Enabled = @"Deidentification:Cohort:Noise:Enabled";
                    public const string LowerBound = @"Deidentification:Cohort:Noise:LowerBound";
                    public const string UpperBound = @"Deidentification:Cohort:Noise:UpperBound";
                }

                public static class LowCellSizeMasking
                {
                    public const string Enabled = @"Deidentification:Cohort:LowCellSizeMasking:Enabled";
                    public const string Threshold = @"Deidentification:Cohort:LowCellSizeMasking:Threshold";
                }
            }
        }
    }
}
