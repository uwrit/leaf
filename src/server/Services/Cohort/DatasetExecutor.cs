﻿// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Model.Anonymization;
using Model.Authorization;
using Model.Cohort;
using Model.Compiler;
using Model.Options;

namespace Services.Cohort
{
    public class DatasetExecutor : DatasetProvider.IDatasetExecutor
    {
        readonly IUserContext user;
        readonly ISqlProviderQueryExecutor queryExecutor;
        readonly ILogger<DatasetExecutor> log;
        readonly ClinDbOptions dbOpts;
        readonly DeidentificationOptions deidentOpts;

        public DatasetExecutor(
            IUserContext user,
            ISqlProviderQueryExecutor queryExecutor,
            ILogger<DatasetExecutor> log,
            IOptions<ClinDbOptions> dbOpts,
            IOptions<DeidentificationOptions> deidentOpts)
        {
            this.user = user;
            this.queryExecutor = queryExecutor;
            this.log = log;
            this.dbOpts = dbOpts.Value;
            this.deidentOpts = deidentOpts.Value;
        }

        public async Task<Dataset> ExecuteDatasetAsync(DatasetExecutionContext context, CancellationToken token)
        {
            var connStr = dbOpts.ConnectionString;
            var timeout = dbOpts.DefaultTimeout;
            var parameters = context.Parameters;
            var sql = context.FullQuery;
            var pepper = context.QueryContext.Pepper;
            var deidentify = deidentOpts.Patient.Enabled && user.Anonymize();

            var reader = await queryExecutor.ExecuteReaderAsync(connStr, sql, timeout, token, parameters);
            var dbSchema = GetShapedSchema(context, reader);
            var marshaller = DatasetMarshaller.For(context, dbSchema, pepper);
            var data = marshaller.Marshal(reader, deidentify, deidentOpts);
            var resultSchema = ShapedDatasetSchema.From(dbSchema, context);

            await reader.CloseAsync();

            return new Dataset(resultSchema, data);
        }

        DatasetResultSchema GetShapedSchema(DatasetExecutionContext context, ILeafDbDataReader reader)
        {
            var shape = context.Shape;
            var actualSchema = GetResultSchema(shape, reader);
            var validationSchema = ValidationSchema.For(context);
            var result = validationSchema.Validate(actualSchema);

            switch (result.State)
            {
                case SchemaValidationState.Warning:
                    log.LogWarning("Dataset Schema Validation Warning. Context:{@Context} Messages:{Messages}", context, result.Messages);
                    break;
                case SchemaValidationState.Error:
                    log.LogError("Dataset Schema Validation Error. Context:{@Context} Messages:{Messages}", context, result.Messages);
                    throw new LeafCompilerException($"Dataset {context.DatasetId} failed schema validation");
            }

            return validationSchema.GetShapedSchema(actualSchema);
        }

        // NOTE(ndobb) potentially check conversions here or above to get raw type into error message, abstruse message if switch falls through LeafType
        DatasetResultSchema GetResultSchema(Shape shape, ILeafDbDataReader reader)
        {
            var columns = reader.GetColumnSchema();
            var fields = columns.Select(c => new SchemaField(c)).ToArray();
            return DatasetResultSchema.For(shape, fields);
        }
    }

    sealed class DynamicMarshaller : DatasetMarshaller
    {
        DatasetExecutionContext _context { get; set; }

        DatasetResultSchema _schema { get; set; }

        public DynamicMarshaller(DatasetExecutionContext context, DatasetResultSchema schema, Guid pepper) : base(pepper)
        {
            _context = context;
            _schema = schema;
        }

        public override IEnumerable<ShapedDataset> Marshal(ILeafDbDataReader reader, bool anonymize, DeidentificationOptions opts)
        {
            var fields = (_context.DatasetQuery as DynamicDatasetQuery).Schema.Fields
                .Where(f => _schema.Fields.Any(sf => sf.Name.Equals(f.Name, StringComparison.InvariantCultureIgnoreCase))
                    && (!anonymize || !f.Phi || (f.Phi && f.Mask)))
                .Select(f => f.ToSchemaField());
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize, fields, opts);

            while (reader.Read())
            {
                var record = GetRecord(reader, fields);
                var dyn = converter(record);
                records.Add(dyn);
            }
            return records;
        }

        Func<DynamicDatasetRecord, DynamicShapedDatumSet> GetConverter(bool anonymize, IEnumerable<SchemaFieldSelector> fields, DeidentificationOptions opts)
        {
            if (anonymize)
            {
                var shift = opts.Patient.DateShifting;
                var anon = new DynamicAnonymizer(Pepper, shift.Increment.ToString(), shift.LowerBound, shift.UpperBound);
                return (rec) =>
                {
                    anon.Anonymize(rec, fields);
                    return rec.ToDatumSet();
                };
            }
            return (rec) => rec.ToDatumSet();
        }

        DynamicDatasetRecord GetRecord(ILeafDbDataReader reader, IEnumerable<SchemaFieldSelector> fields)
        {
            var dyn = new DynamicDatasetRecord
            {
                Salt = reader.GetGuid(reader.GetOrdinal(DatasetColumns.Salt))
            };

            foreach (var f in fields)
            {
                // Ensure Salt is not passed as property
                if (!f.Name.Equals(DatasetColumns.Salt, StringComparison.InvariantCultureIgnoreCase))
                {
                    dyn.SetValue(f.Name, reader[f.Name]);
                }
            }
            return dyn;
        }
    }

    sealed class ConceptMarshaller : DatasetMarshaller
    {
        public ConceptMarshalPlan Plan { get; set; }

        public ConceptMarshaller(DatasetResultSchema schema, Guid pepper) : base(pepper)
        {
            Plan = new ConceptMarshalPlan(schema);
        }

        public override IEnumerable<ShapedDataset> Marshal(ILeafDbDataReader reader, bool anonymize, DeidentificationOptions opts)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize, opts);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var obs = converter(record);
                records.Add(obs);
            }
            return records;
        }

        Func<ConceptDatasetRecord, ConceptDataset> GetConverter(bool anonymize, DeidentificationOptions opts)
        {
            if (anonymize)
            {
                var shift = opts.Patient.DateShifting;
                var anon = new Anonymizer<ConceptDatasetRecord>(Pepper, shift.Increment.ToString(), shift.LowerBound, shift.UpperBound);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToConceptDataset();
                };
            }
            return (rec) => rec.ToConceptDataset();
        }

        ConceptDatasetRecord GetRecord(ILeafDbDataReader reader)
        {
            var rec = new ConceptDatasetRecord
            {
                Salt = reader.GetGuid(Plan.Salt.Index),
                PersonId = reader.GetNullableString(Plan.PersonId?.Index),
                EncounterId = reader.GetNullableString(Plan.EncounterId?.Index),
                DateField = reader.GetNullableDateTime(Plan.DateField?.Index),
                NumberField = reader.GetNullableObject(Plan.NumberField?.Index)
            };

            return rec;
        }
    }

    sealed class ObservationMarshaller : DatasetMarshaller
    {
        public ObservationMarshalPlan Plan { get; set; }

        public ObservationMarshaller(DatasetResultSchema schema, Guid pepper) : base(pepper)
        {
            Plan = new ObservationMarshalPlan(schema);
        }

        public override IEnumerable<ShapedDataset> Marshal(ILeafDbDataReader reader, bool anonymize, DeidentificationOptions opts)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize, opts);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var obs = converter(record);
                records.Add(obs);
            }
            return records;
        }

        Func<ObservationDatasetRecord, Observation> GetConverter(bool anonymize, DeidentificationOptions opts)
        {
            if (anonymize)
            {
                var shift = opts.Patient.DateShifting;
                var anon = new Anonymizer<ObservationDatasetRecord>(Pepper, shift.Increment.ToString(), shift.LowerBound, shift.UpperBound);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToObservation();
                };
            }
            return (rec) => rec.ToObservation();
        }

        ObservationDatasetRecord GetRecord(ILeafDbDataReader reader)
        {
            var rec = new ObservationDatasetRecord
            {
                Salt = reader.GetGuid(Plan.Salt.Index),
                PersonId = reader.GetNullableString(Plan.PersonId?.Index),
                Category = reader.GetNullableString(Plan.Category?.Index),
                Code = reader.GetNullableString(Plan.Code?.Index),
                EffectiveDate = reader.GetNullableDateTime(Plan.EffectiveDate?.Index),
                EncounterId = reader.GetNullableString(Plan.EncounterId?.Index),
                ReferenceRangeLow = reader.GetNullableObject(Plan.ReferenceRangeLow?.Index),
                ReferenceRangeHigh = reader.GetNullableObject(Plan.ReferenceRangeHigh?.Index),
                SpecimenType = reader.GetNullableString(Plan.SpecimenType?.Index),
                ValueString = reader.GetNullableString(Plan.ValueString?.Index),
                ValueQuantity = reader.GetNullableObject(Plan.ValueQuantity?.Index),
                ValueUnit = reader.GetNullableString(Plan.ValueUnit?.Index)
            };

            return rec;
        }
    }

    sealed class MedicationAdministrationMarshaller : DatasetMarshaller
    {
        public MedicationAdministrationMarshalPlan Plan { get; set; }

        public MedicationAdministrationMarshaller(DatasetResultSchema schema, Guid pepper) : base(pepper)
        {
            Plan = new MedicationAdministrationMarshalPlan(schema);
        }

        public override IEnumerable<ShapedDataset> Marshal(ILeafDbDataReader reader, bool anonymize, DeidentificationOptions opts)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize, opts);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var d = converter(record);
                records.Add(d);
            }
            return records;
        }

        Func<MedicationAdministrationDatasetRecord, MedicationAdministration> GetConverter(bool anonymize, DeidentificationOptions opts)
        {
            if (anonymize)
            {
                var shift = opts.Patient.DateShifting;
                var anon = new Anonymizer<MedicationAdministrationDatasetRecord>(Pepper, shift.Increment.ToString(), shift.LowerBound, shift.UpperBound);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToMedicationAdministration();
                };
            }
            return (rec) => rec.ToMedicationAdministration();
        }

        MedicationAdministrationDatasetRecord GetRecord(ILeafDbDataReader reader)
        {
            var d = new MedicationAdministrationDatasetRecord
            {
                Salt = reader.GetGuid(Plan.Salt.Index),
                PersonId = reader.GetNullableString(Plan.PersonId?.Index),
                Code = reader.GetNullableString(Plan.Code?.Index),
                Coding = reader.GetNullableString(Plan.Coding?.Index),
                DoseQuantity = reader.GetNullableObject(Plan.DoseQuantity?.Index),
                DoseUnit = reader.GetNullableString(Plan.DoseUnit?.Index),
                EffectiveDateTime = reader.GetNullableDateTime(Plan.EffectiveDateTime?.Index),
                EncounterId = reader.GetNullableString(Plan.EncounterId?.Index),
                Route = reader.GetNullableString(Plan.Route?.Index),
                Text = reader.GetNullableString(Plan.Text?.Index)
            };

            return d;
        }
    }

    sealed class MedicationRequestMarshaller : DatasetMarshaller
    {
        public MedicationRequestMarshalPlan Plan { get; set; }

        public MedicationRequestMarshaller(DatasetResultSchema schema, Guid pepper) : base(pepper)
        {
            Plan = new MedicationRequestMarshalPlan(schema);
        }

        public override IEnumerable<ShapedDataset> Marshal(ILeafDbDataReader reader, bool anonymize, DeidentificationOptions opts)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize, opts);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var d = converter(record);
                records.Add(d);
            }
            return records;
        }

        Func<MedicationRequestDatasetRecord, MedicationRequest> GetConverter(bool anonymize, DeidentificationOptions opts)
        {
            if (anonymize)
            {
                var shift = opts.Patient.DateShifting;
                var anon = new Anonymizer<MedicationRequestDatasetRecord>(Pepper, shift.Increment.ToString(), shift.LowerBound, shift.UpperBound);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToMedicationRequest();
                };
            }
            return (rec) => rec.ToMedicationRequest();
        }

        MedicationRequestDatasetRecord GetRecord(ILeafDbDataReader reader)
        {
            var d = new MedicationRequestDatasetRecord
            {
                Salt = reader.GetGuid(Plan.Salt.Index),
                PersonId = reader.GetNullableString(Plan.PersonId?.Index),
                Amount = reader.GetNullableObject(Plan.Amount?.Index),
                AuthoredOn = reader.GetNullableDateTime(Plan.AuthoredOn?.Index),
                Category = reader.GetNullableString(Plan.Category?.Index),
                Code = reader.GetNullableString(Plan.Code?.Index),
                Coding = reader.GetNullableString(Plan.Coding?.Index),
                EncounterId = reader.GetNullableString(Plan.EncounterId?.Index),
                Form = reader.GetNullableString(Plan.Form?.Index),
                Text = reader.GetNullableString(Plan.Text?.Index),
                Unit = reader.GetNullableString(Plan.Unit?.Index)
            };

            return d;
        }
    }

    sealed class AllergyMarshaller : DatasetMarshaller
    {
        public AllergyMarshalPlan Plan { get; set; }

        public AllergyMarshaller(DatasetResultSchema schema, Guid pepper) : base(pepper)
        {
            Plan = new AllergyMarshalPlan(schema);
        }

        public override IEnumerable<ShapedDataset> Marshal(ILeafDbDataReader reader, bool anonymize, DeidentificationOptions opts)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize, opts);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var d = converter(record);
                records.Add(d);
            }
            return records;
        }

        Func<AllergyDatasetRecord, Allergy> GetConverter(bool anonymize, DeidentificationOptions opts)
        {
            if (anonymize)
            {
                var shift = opts.Patient.DateShifting;
                var anon = new Anonymizer<AllergyDatasetRecord>(Pepper, shift.Increment.ToString(), shift.LowerBound, shift.UpperBound);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToAllergy();
                };
            }
            return (rec) => rec.ToAllergy();
        }

        AllergyDatasetRecord GetRecord(ILeafDbDataReader reader)
        {
            var d = new AllergyDatasetRecord
            {
                Salt = reader.GetGuid(Plan.Salt.Index),
                PersonId = reader.GetNullableString(Plan.PersonId?.Index),
                Category = reader.GetNullableString(Plan.Category?.Index),
                Code = reader.GetNullableString(Plan.Code?.Index),
                Coding = reader.GetNullableString(Plan.Coding?.Index),
                EncounterId = reader.GetNullableString(Plan.EncounterId?.Index),
                OnsetDateTime = reader.GetNullableDateTime(Plan.OnsetDateTime?.Index),
                RecordedDate = reader.GetNullableDateTime(Plan.RecordedDate?.Index),
                Text = reader.GetNullableString(Plan.Text?.Index)
            };

            return d;
        }
    }

    sealed class ImmunizationMarshaller : DatasetMarshaller
    {
        public ImmunizationMarshalPlan Plan { get; set; }

        public ImmunizationMarshaller(DatasetResultSchema schema, Guid pepper) : base(pepper)
        {
            Plan = new ImmunizationMarshalPlan(schema);
        }

        public override IEnumerable<ShapedDataset> Marshal(ILeafDbDataReader reader, bool anonymize, DeidentificationOptions opts)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize, opts);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var d = converter(record);
                records.Add(d);
            }
            return records;
        }

        Func<ImmunizationDatasetRecord, Immunization> GetConverter(bool anonymize, DeidentificationOptions opts)
        {
            if (anonymize)
            {
                var shift = opts.Patient.DateShifting;
                var anon = new Anonymizer<ImmunizationDatasetRecord>(Pepper, shift.Increment.ToString(), shift.LowerBound, shift.UpperBound);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToImmunization();
                };
            }
            return (rec) => rec.ToImmunization();
        }

        ImmunizationDatasetRecord GetRecord(ILeafDbDataReader reader)
        {
            var d = new ImmunizationDatasetRecord
            {
                Salt = reader.GetGuid(Plan.Salt.Index),
                PersonId = reader.GetNullableString(Plan.PersonId?.Index),
                Coding = reader.GetNullableString(Plan.Coding?.Index),
                DoseQuantity = reader.GetNullableObject(Plan.DoseQuantity?.Index),
                DoseUnit = reader.GetNullableString(Plan.DoseUnit?.Index),
                EncounterId = reader.GetNullableString(Plan.EncounterId?.Index),
                OccurrenceDateTime = reader.GetNullableDateTime(Plan.OccurrenceDateTime?.Index),
                Route = reader.GetNullableString(Plan.Route?.Index),
                Text = reader.GetNullableString(Plan.Text?.Index),
                VaccineCode = reader.GetNullableString(Plan.VaccineCode?.Index)
            };

            return d;
        }
    }

    sealed class ProcedureMarshaller : DatasetMarshaller
    {
        public ProcedureMarshalPlan Plan { get; set; }

        public ProcedureMarshaller(DatasetResultSchema schema, Guid pepper) : base(pepper)
        {
            Plan = new ProcedureMarshalPlan(schema);
        }

        public override IEnumerable<ShapedDataset> Marshal(ILeafDbDataReader reader, bool anonymize, DeidentificationOptions opts)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize, opts);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var d = converter(record);
                records.Add(d);
            }
            return records;
        }

        Func<ProcedureDatasetRecord, Procedure> GetConverter(bool anonymize, DeidentificationOptions opts)
        {
            if (anonymize)
            {
                var shift = opts.Patient.DateShifting;
                var anon = new Anonymizer<ProcedureDatasetRecord>(Pepper, shift.Increment.ToString(), shift.LowerBound, shift.UpperBound);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToProcedure();
                };
            }
            return (rec) => rec.ToProcedure();
        }

        ProcedureDatasetRecord GetRecord(ILeafDbDataReader reader)
        {
            var d = new ProcedureDatasetRecord
            {
                Salt = reader.GetGuid(Plan.Salt.Index),
                PersonId = reader.GetNullableString(Plan.PersonId?.Index),
                Category = reader.GetNullableString(Plan.Category?.Index),
                Code = reader.GetNullableString(Plan.Code?.Index),
                Coding = reader.GetNullableString(Plan.Coding?.Index),
                EncounterId = reader.GetNullableString(Plan.EncounterId?.Index),
                PerformedDateTime = reader.GetNullableDateTime(Plan.PerformedDateTime?.Index),
                Text = reader.GetNullableString(Plan.Text?.Index)
            };

            return d;
        }
    }

    sealed class ConditionMarshaller : DatasetMarshaller
    {
        public ConditionMarshalPlan Plan { get; set; }

        public ConditionMarshaller(DatasetResultSchema schema, Guid pepper) : base(pepper)
        {
            Plan = new ConditionMarshalPlan(schema);
        }

        public override IEnumerable<ShapedDataset> Marshal(ILeafDbDataReader reader, bool anonymize, DeidentificationOptions opts)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize, opts);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var d = converter(record);
                records.Add(d);
            }
            return records;
        }

        Func<ConditionDatasetRecord, Condition> GetConverter(bool anonymize, DeidentificationOptions opts)
        {
            if (anonymize)
            {
                var shift = opts.Patient.DateShifting;
                var anon = new Anonymizer<ConditionDatasetRecord>(Pepper, shift.Increment.ToString(), shift.LowerBound, shift.UpperBound);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToCondition();
                };
            }
            return (rec) => rec.ToCondition();
        }

        ConditionDatasetRecord GetRecord(ILeafDbDataReader reader)
        {
            var d = new ConditionDatasetRecord
            {
                Salt = reader.GetGuid(Plan.Salt.Index),
                PersonId = reader.GetNullableString(Plan.PersonId?.Index),
                AbatementDateTime = reader.GetNullableDateTime(Plan.AbatementDateTime?.Index),
                Category = reader.GetNullableString(Plan.Category?.Index),
                Code = reader.GetNullableString(Plan.Code?.Index),
                Coding = reader.GetNullableString(Plan.Coding?.Index),
                EncounterId = reader.GetNullableString(Plan.EncounterId?.Index),
                OnsetDateTime = reader.GetNullableDateTime(Plan.OnsetDateTime?.Index),
                RecordedDate = reader.GetNullableDateTime(Plan.RecordedDate?.Index),
                Text = reader.GetNullableString(Plan.Text?.Index)
            };

            return d;
        }
    }

    sealed class EncounterMarshaller : DatasetMarshaller
    {
        public EncounterMarshalPlan Plan { get; set; }

        public EncounterMarshaller(DatasetResultSchema schema, Guid pepper) : base(pepper)
        {
            Plan = new EncounterMarshalPlan(schema);
        }

        public override IEnumerable<ShapedDataset> Marshal(ILeafDbDataReader reader, bool anonymize, DeidentificationOptions opts)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize, opts);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var enc = converter(record);
                records.Add(enc);
            }
            return records;
        }

        Func<EncounterDatasetRecord, Encounter> GetConverter(bool anonymize, DeidentificationOptions opts)
        {
            if (anonymize)
            {
                var shift = opts.Patient.DateShifting;
                var anon = new Anonymizer<EncounterDatasetRecord>(Pepper, shift.Increment.ToString(), shift.LowerBound, shift.UpperBound);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToEncounter();
                };
            }
            return (rec) => rec.ToEncounter();
        }

        EncounterDatasetRecord GetRecord(ILeafDbDataReader reader)
        {
            var enc = new EncounterDatasetRecord
            {
                Salt = reader.GetGuid(Plan.Salt.Index),
                PersonId = reader.GetNullableString(Plan.PersonId?.Index),
                AdmitDate = reader.GetNullableDateTime(Plan.AdmitDate?.Index),
                AdmitSource = reader.GetNullableString(Plan.AdmitSource?.Index),
                Class = reader.GetNullableString(Plan.Class?.Index),
                DischargeDate = reader.GetNullableDateTime(Plan.DischargeDate?.Index),
                DischargeDisposition = reader.GetNullableString(Plan.DischargeDisposition?.Index),
                EncounterId = reader.GetNullableString(Plan.EncounterId?.Index),
                Location = reader.GetNullableString(Plan.Location?.Index),
                Status = reader.GetNullableString(Plan.Status?.Index)
            };

            return enc;
        }
    }
}
