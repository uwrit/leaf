// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using System.Collections.Generic;
using System.Data.SqlClient;
using Model.Cohort;

namespace Services.Cohort
{
    abstract class DatasetMarshaller
    {
        public Guid Pepper { get; set; }

        protected DatasetMarshaller(Guid pepper)
        {
            Pepper = pepper;
        }

        public static DatasetMarshaller For(DatasetExecutionContext context, DatasetResultSchema schema, Guid pepper)
        {
            switch (context.Shape)
            {
                case Shape.Dynamic:
                    return new DynamicMarshaller(context, schema, pepper);
                case Shape.Observation:
                    return new ObservationMarshaller(schema, pepper);
                case Shape.Encounter:
                    return new EncounterMarshaller(schema, pepper);
                case Shape.Condition:
                    return new ConditionMarshaller(schema, pepper);
                case Shape.Procedure:
                    return new ProcedureMarshaller(schema, pepper);
                case Shape.Immunization:
                    return new ImmunizationMarshaller(schema, pepper);
                case Shape.Allergy:
                    return new AllergyMarshaller(schema, pepper);
                case Shape.MedicationRequest:
                    return new MedicationRequestMarshaller(schema, pepper);
                case Shape.MedicationAdministration:
                    return new MedicationAdministrationMarshaller(schema, pepper);
                default:
                    throw new ArgumentException($"{context.Shape.ToString()} switch branch not implemented");
            }
        }

        public abstract IEnumerable<ShapedDataset> Marshal(SqlDataReader reader, bool anonymize);
    }
}
