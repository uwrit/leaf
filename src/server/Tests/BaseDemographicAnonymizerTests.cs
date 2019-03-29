// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Text;
using Model.Cohort;
using Services.Cohort;
using Services.Extensions;
using Xunit;

namespace Tests
{
    public class BaseDemographicAnonymizerTests
    {
        static PatientDemographicRecord GetPatient()
        {
            return new PatientDemographicRecord
            {
                Exported = true,
                MaybeSalt = Guid.NewGuid(),
                PersonId = "abc123",
                AddressPostalCode = "98101",
                AddressState = "WA",
                Ethnicity = "Ethnicity",
                Gender = "Female",
                Language = "English",
                MaritalStatus = "Single",
                Race = "Race",
                Religion = "Religion",
                IsMarried = false,
                IsHispanic = false,
                IsDeceased = false,
                BirthDate = new DateTime(1990, 6, 12)
            };
        }

        [Fact]
        public void Should_Produce_Different_PersonId()
        {
            var pepper = Guid.NewGuid();
            var patient = GetPatient();

            using (var mizer1 = new DemographicAnonymizer(pepper))
            {
                var anon = mizer1.Anonymize(patient);

                Assert.NotEqual(patient.PersonId, anon.PersonId);
            }
        }

        [Fact]
        public void Should_Reliably_Hash_PersonId_Across_Instances()
        {
            var pepper = Guid.NewGuid();
            var patient = GetPatient();

            using (var mizer1 = new DemographicAnonymizer(pepper))
            using (var mizer2 = new DemographicAnonymizer(pepper))
            {
                var anon1 = mizer1.Anonymize(patient);
                var anon2 = mizer2.Anonymize(patient);

                Assert.Equal(anon1.PersonId, anon2.PersonId);
            }
        }

        [Fact]
        public void Should_Reliably_Shift_BirthDate_Across_Instances()
        {
            var pepper = Guid.NewGuid();
            var patient = GetPatient();

            using (var mizer1 = new DemographicAnonymizer(pepper))
            using (var mizer2 = new DemographicAnonymizer(pepper))
            {
                var anon1 = mizer1.Anonymize(patient);
                var anon2 = mizer2.Anonymize(patient);

                Assert.Equal(anon1.BirthDate, anon2.BirthDate);
            }
        }

        [Fact]
        public void Crypto_Should_Produce_Different_PersonId()
        {
            var pepper = Guid.NewGuid();
            var patient = GetPatient();

            using (var mizer1 = new DemographicCryptoAnonymizer(pepper))
            {
                var anon = mizer1.Anonymize(patient);

                Assert.NotEqual(patient.PersonId, anon.PersonId);
            }
        }

        [Fact]
        public void Crypto_Should_Reliably_Hash_PersonId_Across_Instances()
        {
            var pepper = Guid.NewGuid();
            var patient = GetPatient();

            using (var mizer1 = new DemographicCryptoAnonymizer(pepper))
            using (var mizer2 = new DemographicCryptoAnonymizer(pepper))
            {
                var anon1 = mizer1.Anonymize(patient);
                var anon2 = mizer2.Anonymize(patient);

                Assert.Equal(anon1.PersonId, anon2.PersonId);
            }
        }

        [Fact]
        public void Crypto_Should_Reliably_Shift_BirthDate_Across_Instances()
        {
            var pepper = Guid.NewGuid();
            var patient = GetPatient();

            using (var mizer1 = new DemographicCryptoAnonymizer(pepper))
            using (var mizer2 = new DemographicCryptoAnonymizer(pepper))
            {
                var anon1 = mizer1.Anonymize(patient);
                var anon2 = mizer2.Anonymize(patient);

                Assert.Equal(anon1.BirthDate, anon2.BirthDate);
            }
        }
    }
}
