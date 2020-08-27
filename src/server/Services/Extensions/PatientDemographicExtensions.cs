// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Cohort;

// TODO(cspital) move this into the Model?

namespace Services.Extensions
{
    public static class PatientDemographicExtensions
    {
        public static int? CalculateAge(this PatientDemographic patient)
        {
            if (patient.Age.HasValue)
            {
                return patient.Age.Value;
            }

            if (!patient.BirthDate.HasValue)
            {
                return null;
            }

            if (patient.IsDeceased.HasValue && patient.IsDeceased.Value && !patient.DeceasedDateTime.HasValue)
            {
                return null;
            }

            DateTime upper = DateTime.Today;
            if (patient.IsDeceased.HasValue && patient.IsDeceased.Value && patient.DeceasedDateTime.HasValue)
            {
                upper = patient.DeceasedDateTime.Value;
            }

            var bday = patient.BirthDate.Value;
            var age = upper.Year - bday.Year;
            if (upper < bday.AddYears(age))
            {
                age--;
            }

            return age;
        }
    }
}
