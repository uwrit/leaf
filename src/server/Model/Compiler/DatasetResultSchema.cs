// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Cohort;

namespace Model.Compiler
{
    public abstract class DatasetResultSchema : Schema<SchemaField>
    {
        public static DatasetResultSchema For(Shape shape, ICollection<SchemaField> fields)
        {
            switch (shape)
            {
                case Shape.Observation:
                    return new ObservationDatasetResultSchema(fields);
                case Shape.Encounter:
                    return new EncounterDatasetResultSchema(fields);
                case Shape.Demographic:
                    return new DemographicResultSchema(fields);
                case Shape.Condition:
                    return new ConditionResultSchema(fields);
                case Shape.Procedure:
                    return new ProcedureResultSchema(fields);
                case Shape.Immunization:
                    return new ImmunizationResultSchema(fields);
                case Shape.Allergy:
                    return new AllergyResultSchema(fields);
                case Shape.MedicationRequest:
                    return new MedicationRequestResultSchema(fields);
                case Shape.MedicationAdministration:
                    return new MedicationAdministrationResultSchema(fields);
                default:
                    throw new ArgumentException($"{shape.ToString()} switch branch not implemented");
            }
        }

        public bool Has(string name)
        {
            return Fields.Any(f => f.Name.Equals(name, StringComparison.InvariantCultureIgnoreCase));
        }

        public bool Has(BaseSchemaField field)
        {
            return Fields.Any(f => f.Name.Equals(field.Name, StringComparison.InvariantCultureIgnoreCase));
        }

        public bool TryGet(string name, out SchemaField found)
        {
            var field = Fields.FirstOrDefault(f => f.Name.Equals(name, StringComparison.InvariantCultureIgnoreCase));
            found = field;
            return field != null;
        }

        public SchemaField Get(BaseSchemaField field)
        {
            return Fields.FirstOrDefault(f => f.Name.Equals(field.Name, StringComparison.InvariantCultureIgnoreCase));
        }
    }

    public sealed class ObservationDatasetResultSchema : DatasetResultSchema
    {
        public ObservationDatasetResultSchema(ICollection<SchemaField> fields)
        {
            Shape = Shape.Observation;
            Fields = fields;
        }
    }

    public sealed class EncounterDatasetResultSchema : DatasetResultSchema
    {
        public EncounterDatasetResultSchema(ICollection<SchemaField> fields)
        {
            Shape = Shape.Encounter;
            Fields = fields;
        }
    }

    public sealed class DemographicResultSchema : DatasetResultSchema
    {
        public DemographicResultSchema(ICollection<SchemaField> fields)
        {
            Shape = Shape.Demographic;
            Fields = fields;
        }
    }

    public sealed class ConditionResultSchema : DatasetResultSchema
    {
        public ConditionResultSchema(ICollection<SchemaField> fields)
        {
            Shape = Shape.Condition;
            Fields = fields;
        }
    }

    public sealed class ProcedureResultSchema : DatasetResultSchema
    {
        public ProcedureResultSchema(ICollection<SchemaField> fields)
        {
            Shape = Shape.Procedure;
            Fields = fields;
        }
    }

    public sealed class ImmunizationResultSchema : DatasetResultSchema
    {
        public ImmunizationResultSchema(ICollection<SchemaField> fields)
        {
            Shape = Shape.Immunization;
            Fields = fields;
        }
    }

    public sealed class AllergyResultSchema : DatasetResultSchema
    {
        public AllergyResultSchema(ICollection<SchemaField> fields)
        {
            Shape = Shape.Allergy;
            Fields = fields;
        }
    }

    public sealed class MedicationRequestResultSchema : DatasetResultSchema
    {
        public MedicationRequestResultSchema(ICollection<SchemaField> fields)
        {
            Shape = Shape.MedicationRequest;
            Fields = fields;
        }
    }

    public sealed class MedicationAdministrationResultSchema : DatasetResultSchema
    {
        public MedicationAdministrationResultSchema(ICollection<SchemaField> fields)
        {
            Shape = Shape.MedicationAdministration;
            Fields = fields;
        }
    }
}
