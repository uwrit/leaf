// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
namespace API.Options
{
    public static partial class Config
    {
        public static class Cohort
        {
            public const string Section = @"Cohort";
            public const string SetCohort = @"Cohort:SetCohort";
            public const string SetCohortDataSet = @"Cohort:SetCohortDataSet";
            public const string FieldCohortId = @"Cohort:FieldCohortId";
            public const string FieldCohortPersonId = @"Cohort:FieldCohortPersonId";
            public const string FieldCohortDataSetEncounterId = @"Cohort:FieldCohortDataSetEncounterId";
            public const string FieldCohortDataSetFilterId = @"Cohort:FieldCohortDataSetFilterId";
            public const string FieldCohortDataSetStartDate = @"Cohort:FieldCohortDataSetStartDate";
            public const string FieldCohortDataSetEndDate = @"Cohort:FieldCohortDataSetEndDate";
            public const string AliasCohort = @"Cohort:AliasCohort";
            public const string FilterMinutesLagAllowed = @"Cohort:FilterMinutesLagAllowed";
            public const string RowLimit = @"Cohort:RowLimit";
        }
    }
}
