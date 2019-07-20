// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using Model.Compiler;
using System.Collections.Generic;

namespace Model.Cohort
{
    // Represents the contract that user supplied SQL must meet to be valid.
    public abstract class ShapedDatasetContract : Schema<SchemaFieldSelector>
    {
        public static ShapedDatasetContract For(Shape shape)
        {
            switch (shape)
            {
                case Shape.Observation:
                    return ObservationContract.Contract;
                case Shape.Encounter:
                    return EncounterContract.Contract;
                case Shape.Demographic:
                    return DemographicContract.Contract;
                case Shape.Condition:
                    return ConditionContract.Contract;
                case Shape.Procedure:
                    return ProcedureContract.Contract;
                case Shape.Immunization:
                    return ImmunizationContract.Contract;
                case Shape.Allergy:
                    return AllergyContract.Contract;
                case Shape.MedicationRequest:
                    return MedicationRequestContract.Contract;
                case Shape.MedicationAdministration:
                    return MedicationAdministrationContract.Contract;
                default:
                    throw new ArgumentException($"{shape.ToString()} is not implemented in ShapedDatasetContract.For");
            }
        }

        public static ShapedDatasetContract For(DatasetResultSchema schema, DatasetExecutionContext context)
        {
            if (schema.Shape == Shape.Dynamic)
            {
                return new DynamicContract(context.DatasetQuery as DynamicDatasetQuery);
            }
            return For(schema.Shape);
        }

        public virtual ShapedDatasetContract Validate()
        {
            return this;
        }
    }

    public sealed class DynamicContract : ShapedDatasetContract
    {
        public string SqlFieldDate { get; set; }
        public string SqlFieldValueString { get; set; }
        public string SqlFieldValueNumeric { get; set; }
        public bool IsEncounterBased { get; set; }

        public DynamicContract()
        {

        }

        public DynamicContract(DynamicDatasetQuery dynamicDataset)
        {
            Shape = Shape.Dynamic;
            Fields = dynamicDataset.Schema.Fields.ToArray();
            SqlFieldDate = dynamicDataset.SqlFieldDate;
            SqlFieldValueString = dynamicDataset.SqlFieldValueString;
            SqlFieldValueNumeric = dynamicDataset.SqlFieldValueNumeric;
            IsEncounterBased = dynamicDataset.IsEncounterBased;
        }

        public override ShapedDatasetContract Validate()
        {
            return new DynamicContract
            {
                Shape = Shape,
                Fields = Fields,
                SqlFieldDate = SqlFieldDate,
                SqlFieldValueString = SqlFieldValueString,
                SqlFieldValueNumeric = SqlFieldValueNumeric,
                IsEncounterBased = IsEncounterBased
            };
        }
    }

    public sealed class ObservationContract : ShapedDatasetContract
    {
        static Lazy<ObservationContract> _contract = new Lazy<ObservationContract>(() => new ObservationContract());

        public static ObservationContract Contract => _contract.Value;

        ObservationContract()
        {
            Shape = Shape.Observation;
            Fields = ShapedDatasetSchemaExtractor.Extract<Observation>();
        }
    }

    public sealed class EncounterContract : ShapedDatasetContract
    {
        static Lazy<EncounterContract> _contract = new Lazy<EncounterContract>(() => new EncounterContract());

        public static EncounterContract Contract => _contract.Value;

        EncounterContract()
        {
            Shape = Shape.Encounter;
            Fields = ShapedDatasetSchemaExtractor.Extract<Encounter>();
        }
    }

    public sealed class DemographicContract : ShapedDatasetContract
    {
        static Lazy<DemographicContract> _contract = new Lazy<DemographicContract>(() => new DemographicContract());

        public static DemographicContract Contract => _contract.Value;

        DemographicContract()
        {
            Shape = Shape.Demographic;
            Fields = ShapedDatasetSchemaExtractor.Extract<PatientDemographic>();
        }
    }

    public sealed class ConditionContract : ShapedDatasetContract
    {
        static Lazy<ConditionContract> _contract = new Lazy<ConditionContract>(() => new ConditionContract());

        public static ConditionContract Contract => _contract.Value;

        ConditionContract()
        {
            Shape = Shape.Condition;
            Fields = ShapedDatasetSchemaExtractor.Extract<Condition>();
        }
    }

    public sealed class ProcedureContract : ShapedDatasetContract
    {
        static Lazy<ProcedureContract> _contract = new Lazy<ProcedureContract>(() => new ProcedureContract());

        public static ProcedureContract Contract => _contract.Value;

        ProcedureContract()
        {
            Shape = Shape.Procedure;
            Fields = ShapedDatasetSchemaExtractor.Extract<Procedure>();
        }
    }

    public sealed class ImmunizationContract : ShapedDatasetContract
    {
        static Lazy<ImmunizationContract> _contract = new Lazy<ImmunizationContract>(() => new ImmunizationContract());

        public static ImmunizationContract Contract => _contract.Value;

        ImmunizationContract()
        {
            Shape = Shape.Immunization;
            Fields = ShapedDatasetSchemaExtractor.Extract<Immunization>();
        }
    }

    public sealed class AllergyContract : ShapedDatasetContract
    {
        static Lazy<AllergyContract> _contract = new Lazy<AllergyContract>(() => new AllergyContract());

        public static AllergyContract Contract => _contract.Value;

        AllergyContract()
        {
            Shape = Shape.Allergy;
            Fields = ShapedDatasetSchemaExtractor.Extract<Allergy>();
        }
    }

    public sealed class MedicationRequestContract : ShapedDatasetContract
    {
        static Lazy<MedicationRequestContract> _contract = new Lazy<MedicationRequestContract>(() => new MedicationRequestContract());

        public static MedicationRequestContract Contract => _contract.Value;

        MedicationRequestContract()
        {
            Shape = Shape.MedicationRequest;
            Fields = ShapedDatasetSchemaExtractor.Extract<MedicationRequest>();
        }
    }

    public sealed class MedicationAdministrationContract : ShapedDatasetContract
    {
        static Lazy<MedicationAdministrationContract> _contract = new Lazy<MedicationAdministrationContract>(() => new MedicationAdministrationContract());

        public static MedicationAdministrationContract Contract => _contract.Value;

        MedicationAdministrationContract()
        {
            Shape = Shape.MedicationRequest;
            Fields = ShapedDatasetSchemaExtractor.Extract<MedicationAdministration>();
        }
    }
}
