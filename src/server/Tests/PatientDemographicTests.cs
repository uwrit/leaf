// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Cohort;
using Services.Extensions;
using Xunit;

namespace Tests
{
    public class PatientDemographicTests
    {
        [Fact]
        public void CalculateAge_Should_Return_Null_If_No_BirthDate()
        {
            var patient = new PatientDemographic { };

            var age = patient.CalculateAge();

            Assert.Null(age);
        }

        [Fact]
        public void CalculateAge_Should_Return_Null_If_Deceased_No_DeathDate()
        {
            var patient = new PatientDemographic
            {
                BirthDate = new DateTime(1990, 1, 1),
                IsDeceased = true
            };

            var age = patient.CalculateAge();

            Assert.Null(age);
        }

        [Fact]
        public void CalculateAge_Should_Return_Current_Age_If_Not_Deceased()
        {
            var patient = new PatientDemographic
            {
                BirthDate = new DateTime(1990, 1, 1),
                IsDeceased = false
            };

            var age = patient.CalculateAge();

            Assert.True(age.HasValue && age.Value >= 28);
        }

        [Fact]
        public void CalculateAge_Should_Return_Age_At_Death_If_Deceased_With_Date()
        {
            var patient = new PatientDemographic
            {
                BirthDate = new DateTime(1990, 1, 1),
                IsDeceased = true,
                DeathDate = new DateTime(2018, 1, 1)
            };

            var age = patient.CalculateAge();

            Assert.Equal(28, age.Value);
        }
    }
}
