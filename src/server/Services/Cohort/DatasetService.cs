// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Data.SqlClient;
using System.Collections.Generic;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Services.Authorization;
using Services.Compiler;
using Model.Options;
using Model.Cohort;
using Model.Compiler;
using Model.Anonymization;
using Services.Extensions;
using Model.Authorization;

namespace Services.Cohort
{
    public class DatasetService : IDatasetService
    {
        readonly IDatasetSqlCompiler compiler;
        readonly IUserContext user;
        readonly ILogger<DatasetService> log;
        readonly ClinDbOptions opts;

        public DatasetService(
            IDatasetSqlCompiler compiler,
            IUserContext userContext,
            ILogger<DatasetService> log,
            IOptions<ClinDbOptions> opts)
        {
            this.compiler = compiler;
            this.user = userContext;
            this.log = log;
            this.opts = opts.Value;
        }

        public async Task<Dataset> GetDatasetAsync(DatasetCompilerContext context, CancellationToken token)
        {
            var executionCtx = compiler.BuildDatasetSql(context);

            var dataset = await ExecuteDatasetAsync(executionCtx, token);
            log.LogInformation("Compiled Dataset Execution Context. Context:{@Context}", executionCtx);

            return dataset;
        }

        async Task<Dataset> ExecuteDatasetAsync(DatasetExecutionContext context, CancellationToken token)
        {
            var sql = context.CompiledQuery;
            var parameters = context.Parameters.ToArray();
            var pepper = context.QueryContext.Pepper;

            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                using (var cmd = new SqlCommand(sql, cn))
                {
                    cmd.Parameters.AddRange(parameters);
                    using (var reader = await cmd.ExecuteReaderAsync(token))
                    {
                        var dbSchema = GetShapedSchema(context, reader);
                        var marshaller = DatasetMarshaller.For(context.Shape, dbSchema, pepper);
                        var data = marshaller.Marshal(reader, user.Anonymize());
                        var resultSchema = ShapedDatasetSchema.From(dbSchema);

                        return new Dataset
                        {
                            Schema = resultSchema,
                            Results = data.GroupBy(d => d.PersonId).ToDictionary(g => g.Key, g => g.Select(r => r))
                        };
                    }
                }
            }
        }

        DatasetResultSchema GetShapedSchema(DatasetExecutionContext context, SqlDataReader reader)
        {
            var shape = context.Shape;
            var actualSchema = GetResultSchema(shape, reader);
            var validationSchema = ValidationSchema.For(shape);
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

        // NOTE(cspital) potentially check conversions here or above to get raw type into error message, obtuse message if switch falls through LeafType
        DatasetResultSchema GetResultSchema(Shape shape, SqlDataReader reader)
        {
            var columns = reader.GetColumnSchema();
            var fields = columns.Select(c => new SchemaField(c)).ToArray();
            return DatasetResultSchema.For(shape, fields);
        }
    }

    sealed class ObservationMarshaller : DatasetMarshaller
    {
        public ObservationMarshalPlan Plan { get; set; }

        public ObservationMarshaller(DatasetResultSchema schema, Guid pepper) : base(pepper)
        {
            Plan = new ObservationMarshalPlan(schema);
        }

        public override IEnumerable<ShapedDataset> Marshal(SqlDataReader reader, bool anonymize)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var obs = converter(record);
                records.Add(obs);
            }
            return records;
        }

        Func<ObservationDatasetRecord, Observation> GetConverter(bool anonymize)
        {
            if (anonymize)
            {
                var anon = new Anonymizer<ObservationDatasetRecord>(Pepper);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToObservation();
                };
            }
            return (rec) => rec.ToObservation();
        }

        ObservationDatasetRecord GetRecord(SqlDataReader reader)
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

        public override IEnumerable<ShapedDataset> Marshal(SqlDataReader reader, bool anonymize)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var d = converter(record);
                records.Add(d);
            }
            return records;
        }

        Func<MedicationAdministrationDatasetRecord, MedicationAdministration> GetConverter(bool anonymize)
        {
            if (anonymize)
            {
                var anon = new Anonymizer<MedicationAdministrationDatasetRecord>(Pepper);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToMedicationAdministration();
                };
            }
            return (rec) => rec.ToMedicationAdministration();
        }

        MedicationAdministrationDatasetRecord GetRecord(SqlDataReader reader)
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

        public override IEnumerable<ShapedDataset> Marshal(SqlDataReader reader, bool anonymize)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var d = converter(record);
                records.Add(d);
            }
            return records;
        }

        Func<MedicationRequestDatasetRecord, MedicationRequest> GetConverter(bool anonymize)
        {
            if (anonymize)
            {
                var anon = new Anonymizer<MedicationRequestDatasetRecord>(Pepper);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToMedicationRequest();
                };
            }
            return (rec) => rec.ToMedicationRequest();
        }

        MedicationRequestDatasetRecord GetRecord(SqlDataReader reader)
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

        public override IEnumerable<ShapedDataset> Marshal(SqlDataReader reader, bool anonymize)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var d = converter(record);
                records.Add(d);
            }
            return records;
        }

        Func<AllergyDatasetRecord, Allergy> GetConverter(bool anonymize)
        {
            if (anonymize)
            {
                var anon = new Anonymizer<AllergyDatasetRecord>(Pepper);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToAllergy();
                };
            }
            return (rec) => rec.ToAllergy();
        }

        AllergyDatasetRecord GetRecord(SqlDataReader reader)
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

        public override IEnumerable<ShapedDataset> Marshal(SqlDataReader reader, bool anonymize)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var d = converter(record);
                records.Add(d);
            }
            return records;
        }

        Func<ImmunizationDatasetRecord, Immunization> GetConverter(bool anonymize)
        {
            if (anonymize)
            {
                var anon = new Anonymizer<ImmunizationDatasetRecord>(Pepper);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToImmunization();
                };
            }
            return (rec) => rec.ToImmunization();
        }

        ImmunizationDatasetRecord GetRecord(SqlDataReader reader)
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

        public override IEnumerable<ShapedDataset> Marshal(SqlDataReader reader, bool anonymize)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var d = converter(record);
                records.Add(d);
            }
            return records;
        }

        Func<ProcedureDatasetRecord, Procedure> GetConverter(bool anonymize)
        {
            if (anonymize)
            {
                var anon = new Anonymizer<ProcedureDatasetRecord>(Pepper);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToProcedure();
                };
            }
            return (rec) => rec.ToProcedure();
        }

        ProcedureDatasetRecord GetRecord(SqlDataReader reader)
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

        public override IEnumerable<ShapedDataset> Marshal(SqlDataReader reader, bool anonymize)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var d = converter(record);
                records.Add(d);
            }
            return records;
        }

        Func<ConditionDatasetRecord, Condition> GetConverter(bool anonymize)
        {
            if (anonymize)
            {
                var anon = new Anonymizer<ConditionDatasetRecord>(Pepper);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToCondition();
                };
            }
            return (rec) => rec.ToCondition();
        }

        ConditionDatasetRecord GetRecord(SqlDataReader reader)
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

        public override IEnumerable<ShapedDataset> Marshal(SqlDataReader reader, bool anonymize)
        {
            var records = new List<ShapedDataset>();
            var converter = GetConverter(anonymize);
            while (reader.Read())
            {
                var record = GetRecord(reader);
                var enc = converter(record);
                records.Add(enc);
            }
            return records;
        }

        Func<EncounterDatasetRecord, Encounter> GetConverter(bool anonymize)
        {
            if (anonymize)
            {
                var anon = new Anonymizer<EncounterDatasetRecord>(Pepper);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    return rec.ToEncounter();
                };
            }
            return (rec) => rec.ToEncounter();
        }

        EncounterDatasetRecord GetRecord(SqlDataReader reader)
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
