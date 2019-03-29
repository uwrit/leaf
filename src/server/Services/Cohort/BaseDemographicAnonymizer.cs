// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Text;
using Model.Cohort;
using Services.Extensions;

namespace Services.Cohort
{
    public abstract class BaseDemographicAnonymizer
    {
        protected readonly Guid queryPepper;

        protected BaseDemographicAnonymizer(Guid pepper)
        {
            queryPepper = pepper;
        }

        public PatientDemographic Anonymize(PatientDemographicRecord patient)
        {
            if (!patient.MaybeSalt.HasValue)
            {
                throw new InvalidOperationException($"PatientDemographic requires a Salt for anonymization.");
            }

            var seasonedId = GetAnonymizedId(patient);

            return new PatientDemographic
            {
                PersonId = seasonedId,
                AddressPostalCode = patient.AddressPostalCode,
                AddressState = patient.AddressState,
                Ethnicity = patient.Ethnicity,
                Gender = patient.Gender,
                Age = patient.Age,
                Language = patient.Language,
                MaritalStatus = patient.MaritalStatus,
                Race = patient.Race,
                Religion = patient.Religion,
                IsMarried = patient.IsMarried,
                IsHispanic = patient.IsHispanic,
                IsDeceased = patient.IsDeceased
            };
        }

        protected abstract string GetAnonymizedId(PatientDemographicRecord patient);

        protected DateTime? ShiftDate(DateTime? dt, Random rand)
        {
            if (!dt.HasValue)
            {
                return null;
            }

            var value = dt.Value;
            var shift = rand.Next(-1000, 1000);

            return value.AddHours(shift);
        }
    }
}
