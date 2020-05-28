// Copyright (c) 2020, UW Medicine Research IT, University of Washington
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
using System.Collections.Generic;

namespace Tests
{
    public class DynamicAnonymizerTests
    {
        const string personId = "personId";
        const string encounterId = "encounterId";
        const string stringVal = "stringVal";
        const string numVal = "numVal";
        const string dateVal = "dateVal";
        const string boolVal = "boolVal";

        public static SchemaFieldSelector From(string name, bool phi)
        {
            return From(name, phi, LeafType.String);
        }

        public static SchemaFieldSelector From(string name, bool phi, LeafType type)
        {
            return new SchemaFieldSelector { Mask = phi, Phi = phi, Required = true, Type = type, Name = name };
        }

        [Fact]
        public void Should_Mask_Dynamic_PersonId()
        {
            DynamicDatasetRecord record = new DynamicDatasetRecord { Salt = Guid.NewGuid() };
            List<SchemaFieldSelector> fields = new List<SchemaFieldSelector> { From(personId, true) };
            record.SetValue(personId, "abc123");

            var pepper = Guid.NewGuid();
            var anon = new DynamicAnonymizer(pepper);
            anon.Anonymize(record, fields);

            var anonPer = record.GetValue(personId);

            Assert.NotEqual("abc123", anonPer);
            Assert.NotNull(anonPer);
        }

        [Fact]
        public void Should_Mask_Carry_PersonId_To_Datum()
        {
            DynamicDatasetRecord record = new DynamicDatasetRecord { Salt = Guid.NewGuid() };
            List<SchemaFieldSelector> fields = new List<SchemaFieldSelector> { From(personId, true) };
            record.SetValue(personId, "abc123");

            var pepper = Guid.NewGuid();
            var anon = new DynamicAnonymizer(pepper);
            anon.Anonymize(record, fields);

            var anonDatum = record.ToDatumSet();

            Assert.NotEqual("abc123", anonDatum.PersonId);
            Assert.NotNull(anonDatum.PersonId);
        }

        [Fact]
        public void Should_Mask_Dynamic_PersonId_And_EncounterId()
        {
            DynamicDatasetRecord record = new DynamicDatasetRecord { Salt = Guid.NewGuid() };
            List<SchemaFieldSelector> fields = new List<SchemaFieldSelector> { From(personId, true), From(encounterId, true) };
            record.SetValue(personId, "abc123");
            record.SetValue(encounterId, "def456");

            var pepper = Guid.NewGuid();
            var anon = new DynamicAnonymizer(pepper);
            anon.Anonymize(record, fields);

            var anonPer = record.GetValue(personId);
            var anonEnc = record.GetValue(encounterId);

            Assert.NotEqual("abc123", anonPer);
            Assert.NotEqual("def456", anonEnc);
            Assert.NotNull(anonPer);
            Assert.NotNull(anonEnc);
        }

        [Fact]
        public void Should_Shift_Dynamic_Date_NotNull()
        {
            DynamicDatasetRecord record = new DynamicDatasetRecord { Salt = Guid.NewGuid() };
            List<SchemaFieldSelector> fields = new List<SchemaFieldSelector> { From(dateVal, true, LeafType.DateTime) };
            record.SetValue(dateVal, new DateTime(2018, 12, 14, 10, 33, 00));

            var pepper = Guid.NewGuid();
            var anon = new DynamicAnonymizer(pepper);
            anon.Anonymize(record, fields);

            var anonDate = record.GetValue(dateVal);

            Assert.NotNull(anonDate);
            Assert.NotEqual(new DateTime(2018, 12, 14, 10, 33, 00), anonDate);
            Assert.Equal(33, ((DateTime)anonDate).Minute);
        }

        [Fact]
        public void Should_Not_Shift_Dynamic_Date_Null()
        {
            DynamicDatasetRecord record = new DynamicDatasetRecord { Salt = Guid.NewGuid() };
            List<SchemaFieldSelector> fields = new List<SchemaFieldSelector> { From(dateVal, true, LeafType.DateTime) };
            record.SetValue(dateVal, null);

            var pepper = Guid.NewGuid();
            var anon = new DynamicAnonymizer(pepper);
            anon.Anonymize(record, fields);
            var anonDate = record.GetValue(dateVal);

            Assert.Null(anonDate);
        }

        [Fact]
        public void Should_Throw_On_Maskable_Number()
        {
            DynamicDatasetRecord record = new DynamicDatasetRecord { Salt = Guid.NewGuid() };
            List<SchemaFieldSelector> fields = new List<SchemaFieldSelector>
            {
                new SchemaFieldSelector { Mask = true, Phi = true, Required = true, Type = LeafType.Numeric, Name = numVal }
            };
            record.SetValue(numVal, 100);
            var pepper = Guid.NewGuid();
            var anon = new DynamicAnonymizer(pepper);

            Assert.Throws<ArgumentException>(() => anon.Anonymize(record, fields));
        }

        [Fact]
        public void Should_Throw_On_Maskable_Boolean()
        {
            DynamicDatasetRecord record = new DynamicDatasetRecord { Salt = Guid.NewGuid() };
            List<SchemaFieldSelector> fields = new List<SchemaFieldSelector>
            {
                new SchemaFieldSelector { Mask = true, Phi = true, Required = true, Type = LeafType.Bool, Name = boolVal }
            };
            record.SetValue(boolVal, false);
            var pepper = Guid.NewGuid();
            var anon = new DynamicAnonymizer(pepper);

            Assert.Throws<ArgumentException>(() => anon.Anonymize(record, fields));
        }

        [Fact]
        public void Should_Throw_On_Unmaskable_Phi()
        {
            DynamicDatasetRecord record = new DynamicDatasetRecord { Salt = Guid.NewGuid() };
            List<SchemaFieldSelector> fields = new List<SchemaFieldSelector>
            {
                new SchemaFieldSelector { Mask = false, Phi = true, Required = true, Type = LeafType.DateTime, Name = dateVal }
            };
            record.SetValue(dateVal, new DateTime(2018, 12, 14, 10, 33, 00));
            var pepper = Guid.NewGuid();
            var anon = new DynamicAnonymizer(pepper);

            Assert.Throws<LeafDynamicAnonymizerException>(() => anon.Anonymize(record, fields));
        }
    }
}
