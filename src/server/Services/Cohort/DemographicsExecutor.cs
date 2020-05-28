// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
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
using Services.Extensions;

// TODO(cspital) split anonymization from executor return step, model should anonymize, not a service impl

namespace Services.Cohort
{
    public class DemographicsExecutor : DemographicProvider.IDemographicsExecutor
    {
        readonly IUserContext user;
        readonly ILogger<DemographicsExecutor> log;
        readonly ClinDbOptions opts;

        public DemographicsExecutor(
            IUserContext userContext,
            ILogger<DemographicsExecutor> log,
            IOptions<ClinDbOptions> opts)
        {
            this.log = log;
            this.opts = opts.Value;
            user = userContext;
        }

        public async Task<PatientDemographicContext> ExecuteDemographicsAsync(DemographicExecutionContext context, CancellationToken token)
        {
            var sql = context.CompiledQuery;
            var parameters = context.SqlParameters();
            var pepper = context.QueryContext.Pepper;

            using (var cn = new SqlConnection(opts.ConnectionString))
            {
                await cn.OpenAsync();

                using (var cmd = new SqlCommand(sql, cn))
                {
                    cmd.Parameters.AddRange(parameters);
                    using (var reader = await cmd.ExecuteReaderAsync(token))
                    {
                        var resultSchema = GetShapedSchema(context, reader);
                        var marshaller = new DemographicMarshaller(resultSchema, pepper);
                        return marshaller.Marshal(reader, user.Anonymize());
                    }
                }
            }
        }

        DatasetResultSchema GetShapedSchema(DemographicExecutionContext context, SqlDataReader reader)
        {
            var shape = context.Shape;
            var actualSchema = GetResultSchema(shape, reader);
            var validationSchema = ValidationSchema.For(context);
            var result = validationSchema.Validate(actualSchema);

            switch (result.State)
            {
                case SchemaValidationState.Warning:
                    log.LogWarning("Demographic Schema Validation Warning. Messages:{Messages}", result.Messages);
                    break;
                case SchemaValidationState.Error:
                    log.LogError("Demographic Schema Validation Error. Messages:{Messages}", result.Messages);
                    throw new LeafCompilerException($"Demographic query failed schema validation");
            }

            return validationSchema.GetShapedSchema(actualSchema);
        }

        DatasetResultSchema GetResultSchema(Shape shape, SqlDataReader reader)
        {
            var columns = reader.GetColumnSchema();
            var fields = columns.Select(c => new SchemaField(c)).ToArray();
            return DatasetResultSchema.For(shape, fields);
        }
    }

    sealed class DemographicMarshaller
    {
        public DemographicMarshalPlan Plan { get; set; }
        public Guid Pepper { get; set; }

        public DemographicMarshaller(DatasetResultSchema schema, Guid pepper)
        {
            Plan = new DemographicMarshalPlan(schema);
            Pepper = pepper;
        }

        public PatientDemographicContext Marshal(SqlDataReader reader, bool anonymize)
        {
            var exported = new List<PatientDemographic>();
            var cohort = new List<PatientDemographic>();
            var exportConverter = GetExportConverter(anonymize);
            while (reader.Read())
            {
                var cohortRecord = GetCohortRecord(reader);
                cohort.Add(cohortRecord.ToIdentifiedPatientDemographic());

                if (cohortRecord.Exported)
                {
                    var export = exportConverter(cohortRecord);
                    exported.Add(export);
                }
            }

            return new PatientDemographicContext
            {
                Exported = exported,
                Cohort = cohort
            };
        }

        Func<PatientDemographicRecord, PatientDemographic> GetExportConverter(bool anonymize)
        {
            if (anonymize)
            {
                var anon = new Anonymizer<PatientDemographicRecord>(Pepper);
                return (rec) =>
                {
                    anon.Anonymize(rec);
                    rec.Age = rec.CalculateAge();
                    return rec.ToAnonymousPatientDemographic();
                };
            }
            return (rec) =>
            {
                rec.Age = rec.CalculateAge();
                return rec.ToIdentifiedPatientDemographic();
            };
        }

        PatientDemographicRecord GetCohortRecord(SqlDataReader reader)
        {
            var rec = new PatientDemographicRecord
            {
                Exported = reader.GetBoolean(Plan.Exported.Index),
                MaybeSalt = reader.GetNullableGuid(Plan.Salt.Index),
                PersonId = reader.GetNullableString(Plan.PersonId?.Index),
                AddressPostalCode = reader.GetNullableString(Plan.AddressPostalCode?.Index),
                AddressState = reader.GetNullableString(Plan.AddressState?.Index),
                Ethnicity = reader.GetNullableString(Plan.Ethnicity?.Index),
                Gender = reader.GetNullableString(Plan.Gender?.Index),
                Language = reader.GetNullableString(Plan.Language?.Index),
                MaritalStatus = reader.GetNullableString(Plan.MaritalStatus?.Index),
                Race = reader.GetNullableString(Plan.Race?.Index),
                Religion = reader.GetNullableString(Plan.Religion?.Index),
                IsMarried = reader.GetNullableBoolean(Plan.IsMarried?.Index),
                IsHispanic = reader.GetNullableBoolean(Plan.IsHispanic?.Index),
                IsDeceased = reader.GetNullableBoolean(Plan.IsDeceased?.Index),
                BirthDate = reader.GetNullableDateTime(Plan.BirthDate?.Index),
                DeathDate = reader.GetNullableDateTime(Plan.DeathDate?.Index),
                Name = reader.GetNullableString(Plan.Name?.Index),
                Mrn = reader.GetNullableString(Plan.Mrn?.Index)
            };

            rec.Age = rec.CalculateAge();

            return rec;
        }
    }
}
