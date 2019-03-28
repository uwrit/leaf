// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Xunit;
using Model.Compiler;
using Model.Cohort;
using Tests.Mock.Models;

namespace Tests
{
    public class SchemaTests
    {
        [Fact]
        public void ValidationSchema_Shapes_Overflowed_Schema_Ok()
        {
            var actual = new ObservationDatasetResultSchema(new SchemaField[] {
                new SchemaField { Name = "personId", Type = LeafType.String },
                new SchemaField { Name = "category", Type = LeafType.String },
                new SchemaField { Name = "code", Type = LeafType.String },
                new SchemaField { Name = "effectiveDate", Type = LeafType.DateTime },
                new SchemaField { Name = "encounterId", Type = LeafType.String },
                new SchemaField { Name = "referenceRangeLow", Type = LeafType.Numeric },
                new SchemaField { Name = "referenceRangeHigh", Type = LeafType.Numeric },
                new SchemaField { Name = "specimenType", Type = LeafType.String },
                new SchemaField { Name = "valueString", Type = LeafType.String },
                new SchemaField { Name = "valueQuantity", Type = LeafType.Numeric },
                new SchemaField { Name = "valueUnit", Type = LeafType.String },
                new SchemaField { Name = "testCol", Type = LeafType.String },
            });
            var schema = ObservationValidationSchema.Schema;

            var final = schema.GetShapedSchema(actual);

            Assert.DoesNotContain(final.Fields, f => f.Name == "testCol");
        }

        [Fact]
        public void ShapedDatasetSchemaExtractor_Observation_Ok()
        {
            var fields = ShapedDatasetSchemaExtractor.Extract<Observation>();

            Assert.NotEmpty(fields);
            Assert.Contains(fields, f => f.Name == "personId" && f.Type == LeafType.String);
            Assert.Contains(fields, f => f.Name == "effectiveDate" && f.Type == LeafType.DateTime);
        }

        [Fact]
        public void ShapedDatasetSchemaExtractor_Encounter_Ok()
        {
            var fields = ShapedDatasetSchemaExtractor.Extract<Encounter>();

            Assert.NotEmpty(fields);
            Assert.Contains(fields, f => f.Name == "personId" && f.Type == LeafType.String);
            Assert.Contains(fields, f => f.Name == "location" && f.Type == LeafType.String);
        }

        [Fact]
        public void ShapedDatasetSchemaExtractor_Unmarked_Throws_SchemaValidationException()
        {
            Assert.Throws<SchemaValidationException>(ShapedDatasetSchemaExtractor.Extract<UnmarkedShapedDataset>);
        }

        [Fact]
        public void ObservationValidationSchema_Initializes_Ok()
        {
            var valid = ObservationValidationSchema.Schema;

            Assert.Equal(Shape.Observation, valid.Shape);
            Assert.NotEmpty(valid.Fields);
            Assert.Contains(valid.Fields, f => f.Name == "personId" && f.Type == LeafType.String);
            Assert.Contains(valid.Fields, f => f.Name == "effectiveDate" && f.Type == LeafType.DateTime);
        }

        [Fact]
        public void EncounterValidationSchema_Initializes_Ok()
        {
            var valid = EncounterValidationSchema.Schema;

            Assert.Equal(Shape.Encounter, valid.Shape);
            Assert.NotEmpty(valid.Fields);
            Assert.Contains(valid.Fields, f => f.Name == "personId" && f.Type == LeafType.String);
            Assert.Contains(valid.Fields, f => f.Name == "location" && f.Type == LeafType.String);
        }

        [Fact]
        public void ValidationSchema_Validate_Exact_Ok()
        {
            var actual = new ObservationDatasetResultSchema(new SchemaField[] {
                new SchemaField { Name = "personId", Type = LeafType.String },
                new SchemaField { Name = "category", Type = LeafType.String },
                new SchemaField { Name = "code", Type = LeafType.String },
                new SchemaField { Name = "effectiveDate", Type = LeafType.DateTime },
                new SchemaField { Name = "encounterId", Type = LeafType.String },
                new SchemaField { Name = "referenceRangeLow", Type = LeafType.Numeric },
                new SchemaField { Name = "referenceRangeHigh", Type = LeafType.Numeric },
                new SchemaField { Name = "specimenType", Type = LeafType.String },
                new SchemaField { Name = "valueString", Type = LeafType.String },
                new SchemaField { Name = "valueQuantity", Type = LeafType.Numeric },
                new SchemaField { Name = "valueUnit", Type = LeafType.String },
                new SchemaField { Name = "Salt", Type = LeafType.Guid },
            });
            var schema = ObservationValidationSchema.Schema;

            var result = schema.Validate(actual);

            Assert.Equal(SchemaValidationState.Ok, result.State);
        }

        [Fact]
        public void ValidationSchema_Validate_Partial_Ok()
        {
            var actual = new ObservationDatasetResultSchema(new SchemaField[] {
                new SchemaField { Name = "personId", Type = LeafType.String },
                new SchemaField { Name = "category", Type = LeafType.String },
                new SchemaField { Name = "code", Type = LeafType.String },
                new SchemaField { Name = "effectiveDate", Type = LeafType.DateTime },
                new SchemaField { Name = "encounterId", Type = LeafType.String },
                new SchemaField { Name = "specimenType", Type = LeafType.String },
                new SchemaField { Name = "valueString", Type = LeafType.String },
                new SchemaField { Name = "valueQuantity", Type = LeafType.Numeric },
                new SchemaField { Name = "valueUnit", Type = LeafType.String },
                new SchemaField { Name = "Salt", Type = LeafType.Guid },
            });
            var schema = ObservationValidationSchema.Schema;

            var result = schema.Validate(actual);

            Assert.Equal(SchemaValidationState.Ok, result.State);
        }

        [Fact]
        public void ValidationSchema_Validate_Partial_Error()
        {
            var actual = new ObservationDatasetResultSchema(new SchemaField[] {
                new SchemaField { Name = "personId", Type = LeafType.String },
                new SchemaField { Name = "effectiveDate", Type = LeafType.DateTime },
                new SchemaField { Name = "encounterId", Type = LeafType.String },
                new SchemaField { Name = "specimenType", Type = LeafType.String },
                new SchemaField { Name = "valueString", Type = LeafType.String },
                new SchemaField { Name = "valueQuantity", Type = LeafType.Numeric },
                new SchemaField { Name = "valueUnit", Type = LeafType.String },
            });
            var schema = ObservationValidationSchema.Schema;

            var result = schema.Validate(actual);

            Assert.Equal(SchemaValidationState.Error, result.State);
        }

        [Fact]
        public void ValidationSchema_Validate_Mismatch_Error()
        {
            var actual = new ObservationDatasetResultSchema(new SchemaField[] {
                new SchemaField { Name = "personId", Type = LeafType.Numeric },
                new SchemaField { Name = "category", Type = LeafType.String },
                new SchemaField { Name = "code", Type = LeafType.String },
                new SchemaField { Name = "effectiveDate", Type = LeafType.DateTime },
                new SchemaField { Name = "encounterId", Type = LeafType.String },
                new SchemaField { Name = "referenceRangeLow", Type = LeafType.Numeric },
                new SchemaField { Name = "referenceRangeHigh", Type = LeafType.Numeric },
                new SchemaField { Name = "specimenType", Type = LeafType.String },
                new SchemaField { Name = "valueString", Type = LeafType.String },
                new SchemaField { Name = "valueQuantity", Type = LeafType.Numeric },
                new SchemaField { Name = "valueUnit", Type = LeafType.String },
            });
            var schema = ObservationValidationSchema.Schema;

            var result = schema.Validate(actual);

            Assert.Equal(SchemaValidationState.Error, result.State);
        }

        [Fact]
        public void ValidationSchema_Validate_Overflow_Warning()
        {
            var actual = new ObservationDatasetResultSchema(new SchemaField[] {
                new SchemaField { Name = "personId", Type = LeafType.String },
                new SchemaField { Name = "category", Type = LeafType.String },
                new SchemaField { Name = "code", Type = LeafType.String },
                new SchemaField { Name = "effectiveDate", Type = LeafType.DateTime },
                new SchemaField { Name = "encounterId", Type = LeafType.String },
                new SchemaField { Name = "referenceRangeLow", Type = LeafType.Numeric },
                new SchemaField { Name = "referenceRangeHigh", Type = LeafType.Numeric },
                new SchemaField { Name = "specimenType", Type = LeafType.String },
                new SchemaField { Name = "valueString", Type = LeafType.String },
                new SchemaField { Name = "valueQuantity", Type = LeafType.Numeric },
                new SchemaField { Name = "valueUnit", Type = LeafType.String },
                new SchemaField { Name = "unrecognizedField", Type = LeafType.String },
            });
            var schema = ObservationValidationSchema.Schema;

            var result = schema.CheckOverflow(actual);

            Assert.Equal(SchemaValidationState.Warning, result.State);
        }

        [Fact]
        public void ShapedDatasetSchema_Should_Prune_Salt()
        {
            var actual = new ObservationDatasetResultSchema(new SchemaField[] {
                new SchemaField { Name = "personId", Type = LeafType.String },
                new SchemaField { Name = "category", Type = LeafType.String },
                new SchemaField { Name = "code", Type = LeafType.String },
                new SchemaField { Name = "effectiveDate", Type = LeafType.DateTime },
                new SchemaField { Name = "encounterId", Type = LeafType.String },
                new SchemaField { Name = "referenceRangeLow", Type = LeafType.Numeric },
                new SchemaField { Name = "referenceRangeHigh", Type = LeafType.Numeric },
                new SchemaField { Name = "specimenType", Type = LeafType.String },
                new SchemaField { Name = "valueString", Type = LeafType.String },
                new SchemaField { Name = "valueQuantity", Type = LeafType.Numeric },
                new SchemaField { Name = "valueUnit", Type = LeafType.String },
                new SchemaField { Name = "unrecognizedField", Type = LeafType.String },
                new SchemaField { Name = "Salt", Type = LeafType.Guid }
            });

            var datasetSchema = ShapedDatasetSchema.From(actual);

            Assert.DoesNotContain(datasetSchema.Fields, f => f.Name == "Salt");
            Assert.DoesNotContain(datasetSchema.Fields, f => f.Name == "unrecognizedField");
        }
    }
}
