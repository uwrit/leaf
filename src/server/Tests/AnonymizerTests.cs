// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Reflection;
using Xunit;
using Model.Cohort;
using Model.Anonymization;
using Model.Compiler;
using Model.Schema;

namespace Tests
{
    public class AnonymizerTests
    {
        [Fact]
        public void Should_Only_Mask_Observation_PersonId()
        {
            var pepper = Guid.NewGuid();
            var obs = new ObservationDatasetRecord { PersonId = "abc123", Salt = Guid.NewGuid() };
            var anon = new Anonymizer<ObservationDatasetRecord>(pepper);

            anon.Anonymize(obs);

            Assert.NotEqual("abc123", obs.PersonId);
            Assert.Null(obs.EncounterId);
        }

        [Fact]
        public void Should_Mask_Observation_PersonId_And_EncounterId()
        {
            var pepper = Guid.NewGuid();
            var obs = new ObservationDatasetRecord { Salt = Guid.NewGuid(), PersonId = "abc123", EncounterId = "def456" };
            var anon = new Anonymizer<ObservationDatasetRecord>(pepper);

            anon.Anonymize(obs);

            Assert.NotEqual("abc123", obs.PersonId);
            Assert.NotEqual("def456", obs.EncounterId);
        }

        [Fact]
        public void Should_Shift_Observation_EffectiveDate_NotNull()
        {
            var pepper = Guid.NewGuid();
            var obs = new ObservationDatasetRecord { Salt = Guid.NewGuid(), EffectiveDate = new DateTime(2018, 12, 14, 10, 33, 00) };
            var anon = new Anonymizer<ObservationDatasetRecord>(pepper);

            anon.Anonymize(obs);

            Assert.NotNull(obs.EffectiveDate);
            Assert.NotEqual(new DateTime(2018, 12, 14, 10, 33, 00), obs.EffectiveDate);
            Assert.Equal(33, obs.EffectiveDate.Value.Minute);
        }

        [Fact]
        public void Should_Not_Shift_Observation_EffectiveDate_Null()
        {
            var pepper = Guid.NewGuid();
            var obs = new ObservationDatasetRecord { Salt = Guid.NewGuid() };
            var anon = new Anonymizer<ObservationDatasetRecord>(pepper);

            anon.Anonymize(obs);

            Assert.Null(obs.EffectiveDate);
        }

        [Fact]
        public void Should_Only_Mask_Encounter_PersonId()
        {
            var pepper = Guid.NewGuid();
            var enc = new EncounterDatasetRecord { Salt = Guid.NewGuid(), PersonId = "abc123" };
            var anon = new Anonymizer<EncounterDatasetRecord>(pepper);

            anon.Anonymize(enc);

            Assert.NotEqual("abc123", enc.PersonId);
            Assert.Null(enc.EncounterId);
        }

        [Fact]
        public void Should_Mask_Encounter_PersonId_And_EncounterId()
        {
            var pepper = Guid.NewGuid();
            var enc = new EncounterDatasetRecord { Salt = Guid.NewGuid(), PersonId = "abc123", EncounterId = "def456" };
            var anon = new Anonymizer<EncounterDatasetRecord>(pepper);

            anon.Anonymize(enc);

            Assert.NotEqual("abc123", enc.PersonId);
            Assert.NotEqual("def456", enc.EncounterId);
        }

        [Fact]
        public void Should_Shift_Encounter_AdmitDate_And_DischargeDate_NotNull()
        {
            var pepper = Guid.NewGuid();
            var enc = new EncounterDatasetRecord { Salt = Guid.NewGuid(), AdmitDate = new DateTime(2018, 12, 13, 10, 33, 00), DischargeDate = new DateTime(2018, 12, 14, 10, 33, 00) };
            var anon = new Anonymizer<EncounterDatasetRecord>(pepper);

            var diff = enc.DischargeDate.Value.Subtract(enc.AdmitDate.Value).Minutes;

            anon.Anonymize(enc);

            Assert.NotNull(enc.AdmitDate);
            Assert.NotNull(enc.DischargeDate);
            Assert.NotEqual(new DateTime(2018, 12, 13, 10, 33, 00), enc.AdmitDate);
            Assert.NotEqual(new DateTime(2018, 12, 14, 10, 33, 00), enc.DischargeDate);
            Assert.Equal(diff, enc.DischargeDate.Value.Subtract(enc.AdmitDate.Value).Minutes);
        }

        [Fact]
        public void Should_Not_Shift_Encounter_AdmitDate_And_DischargeDate_Null()
        {
            var pepper = Guid.NewGuid();
            var enc = new EncounterDatasetRecord { Salt = Guid.NewGuid() };
            var anon = new Anonymizer<EncounterDatasetRecord>(pepper);

            anon.Anonymize(enc);

            Assert.Null(enc.AdmitDate);
            Assert.Null(enc.DischargeDate);
        }

        [Fact]
        public void Should_Throw_On_NonNull_Unmaskable_Phi()
        {
            var pepper = Guid.NewGuid();
            Assert.Throws<InvalidOperationException>(() => new Anonymizer<BadMapping>(pepper));
        }
    }

    class BadMapping : ISalt
    {
        public Guid Salt { get; set; }

        [Field(Name = "DateTime", Type = LeafType.DateTime, Phi = true, Mask = false)]
        public DateTime DateTime { get; set; }
    }
}
