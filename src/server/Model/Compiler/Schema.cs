// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Extensions;
using Model.Cohort;

namespace Model.Compiler
{
    public abstract class Schema<T> where T : BaseSchemaField
    {
        public Shape Shape { get; protected set; }
        public ICollection<T> Fields { get; protected set; }
    }

    // Represents the final shape of a ShapedDataset data pull from the database, including Salt and Exported where involved.
    public abstract class ValidationSchema : Schema<SchemaFieldSelector>
    {
        public virtual SchemaValidationResult Validate(DatasetResultSchema actualSchema)
        {
            var result = SchemaValidationResult.Ok(Shape);
            foreach (var field in Fields)
            {
                var actualField = actualSchema.Get(field);

                // required fields missing --> error
                if (actualField == null && field.Required)
                {
                    result.State = SchemaValidationState.Error;
                    result.AddMessage($"required field {field.Name} is missing");
                    continue;
                }

                // type mismatch on recognized field --> error
                if (actualField != null && !actualField.Matches(field))
                {
                    result.State = SchemaValidationState.Error;
                    result.AddMessage($"{field.Name} expected {field.Type} but received {actualField.Type}");
                }
            }

            return result;
        }

        public SchemaValidationResult CheckOverflow(DatasetResultSchema actualSchema)
        {
            var result = SchemaValidationResult.Ok(Shape);
            var overflow = Fields.Except<BaseSchemaField>(actualSchema.Fields, (a, b) => a.Equals(b));
            if (overflow.Any())
            {
                result.State = SchemaValidationState.Warning;
                foreach (var unrec in overflow)
                {
                    result.AddMessage($"unrecognized field {unrec.Name} is not a member of {Shape.ToString()} and will be dropped");
                }
            }
            return result;
        }

        public DatasetResultSchema GetShapedSchema(DatasetResultSchema actualSchema)
        {
            if (actualSchema.Shape == Shape.Dynamic)
            {
                return DatasetResultSchema.For(actualSchema.Shape, actualSchema.Fields);
            }
            var actualFields = actualSchema.Fields.Where(f => Fields.Contains<BaseSchemaField>(f)).ToArray();
            return DatasetResultSchema.For(actualSchema.Shape, actualFields);
        }

        public static ValidationSchema For(ShapedDatasetExecutionContext context)
        {
            switch (context.Shape)
            {
                case Shape.Dynamic:
                    return new DynamicValidationSchema((context.DatasetQuery as DynamicDatasetQuery).Schema.Fields);
                case Shape.Observation:
                    return ObservationValidationSchema.Schema;
                case Shape.Encounter:
                    return EncounterValidationSchema.Schema;
                case Shape.Demographic:
                    return DemographicValidationSchema.Schema;
                case Shape.Condition:
                    return ConditionValidationSchema.Schema;
                case Shape.Procedure:
                    return ProcedureValidationSchema.Schema;
                case Shape.Immunization:
                    return ImmunizationValidationSchema.Schema;
                case Shape.Allergy:
                    return AllergyValidationSchema.Schema;
                case Shape.MedicationRequest:
                    return MedicationRequestValidationSchema.Schema;
                case Shape.MedicationAdministration:
                    return MedicationAdministrationValidationSchema.Schema;
                default:
                    throw new ArgumentException($"{context.Shape.ToString()} is not implemented in ValidationSchema.For");
            }
        }
    }

    public class DynamicValidationSchema : ValidationSchema
    {
        public DynamicValidationSchema(IEnumerable<SchemaFieldSelector> fields)
        {
            Shape = Shape.Dynamic;
            Fields = fields.ToArray();
        }
    }

    public sealed class ObservationValidationSchema : ValidationSchema
    {
        static Lazy<ObservationValidationSchema> _schema = new Lazy<ObservationValidationSchema>(() => new ObservationValidationSchema());

        public static ObservationValidationSchema Schema => _schema.Value;

        ObservationValidationSchema()
        {
            Shape = Shape.Observation;
            Fields = ShapedDatasetSchemaExtractor.Extract<ObservationDatasetRecord>();
        }
    }

    public sealed class EncounterValidationSchema : ValidationSchema
    {
        static Lazy<EncounterValidationSchema> _schema = new Lazy<EncounterValidationSchema>(() => new EncounterValidationSchema());

        public static EncounterValidationSchema Schema => _schema.Value;

        EncounterValidationSchema()
        {
            Shape = Shape.Encounter;
            Fields = ShapedDatasetSchemaExtractor.Extract<EncounterDatasetRecord>();
        }
    }

    public sealed class DemographicValidationSchema : ValidationSchema
    {
        static Lazy<DemographicValidationSchema> _schema = new Lazy<DemographicValidationSchema>(() => new DemographicValidationSchema());

        public static DemographicValidationSchema Schema => _schema.Value;

        DemographicValidationSchema()
        {
            Shape = Shape.Demographic;
            Fields = ShapedDatasetSchemaExtractor.Extract<PatientDemographicRecord>();
        }
    }

    public sealed class ConditionValidationSchema : ValidationSchema
    {
        static Lazy<ConditionValidationSchema> _schema = new Lazy<ConditionValidationSchema>(() => new ConditionValidationSchema());

        public static ConditionValidationSchema Schema => _schema.Value;

        ConditionValidationSchema()
        {
            Shape = Shape.Demographic;
            Fields = ShapedDatasetSchemaExtractor.Extract<ConditionDatasetRecord>();
        }
    }

    public sealed class ProcedureValidationSchema : ValidationSchema
    {
        static Lazy<ProcedureValidationSchema> _schema = new Lazy<ProcedureValidationSchema>(() => new ProcedureValidationSchema());

        public static ProcedureValidationSchema Schema => _schema.Value;

        ProcedureValidationSchema()
        {
            Shape = Shape.Demographic;
            Fields = ShapedDatasetSchemaExtractor.Extract<ProcedureDatasetRecord>();
        }
    }

    public sealed class ImmunizationValidationSchema : ValidationSchema
    {
        static Lazy<ImmunizationValidationSchema> _schema = new Lazy<ImmunizationValidationSchema>(() => new ImmunizationValidationSchema());

        public static ImmunizationValidationSchema Schema => _schema.Value;

        ImmunizationValidationSchema()
        {
            Shape = Shape.Demographic;
            Fields = ShapedDatasetSchemaExtractor.Extract<ImmunizationDatasetRecord>();
        }
    }

    public sealed class AllergyValidationSchema : ValidationSchema
    {
        static Lazy<AllergyValidationSchema> _schema = new Lazy<AllergyValidationSchema>(() => new AllergyValidationSchema());

        public static AllergyValidationSchema Schema => _schema.Value;

        AllergyValidationSchema()
        {
            Shape = Shape.Demographic;
            Fields = ShapedDatasetSchemaExtractor.Extract<AllergyDatasetRecord>();
        }
    }

    public sealed class MedicationRequestValidationSchema : ValidationSchema
    {
        static Lazy<MedicationRequestValidationSchema> _schema = new Lazy<MedicationRequestValidationSchema>(() => new MedicationRequestValidationSchema());

        public static MedicationRequestValidationSchema Schema => _schema.Value;

        MedicationRequestValidationSchema()
        {
            Shape = Shape.Demographic;
            Fields = ShapedDatasetSchemaExtractor.Extract<MedicationRequestDatasetRecord>();
        }
    }

    public sealed class MedicationAdministrationValidationSchema : ValidationSchema
    {
        static Lazy<MedicationAdministrationValidationSchema> _schema = new Lazy<MedicationAdministrationValidationSchema>(() => new MedicationAdministrationValidationSchema());

        public static MedicationAdministrationValidationSchema Schema => _schema.Value;

        MedicationAdministrationValidationSchema()
        {
            Shape = Shape.Demographic;
            Fields = ShapedDatasetSchemaExtractor.Extract<MedicationAdministrationDatasetRecord>();
        }
    }
}
