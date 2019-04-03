// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using Services.Compiler;
using Model.Cohort;
using Model.Compiler;
using Model.Options;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Services.Authorization;
using System.Data.SqlClient;
using Services.Extensions;
using Model.Anonymization;
using Model.Authorization;

namespace Services.Cohort
{
    public class DemographicService : IDemographicService
    {
        readonly IDemographicSqlCompiler compiler;
        readonly IUserContext user;
        readonly ILogger<DemographicService> log;
        readonly ClinDbOptions opts;

        public DemographicService(
            IDemographicSqlCompiler compiler,
            IUserContext userContext,
            ILogger<DemographicService> log,
            IOptions<ClinDbOptions> opts)
        {
            this.compiler = compiler;
            this.log = log;
            this.opts = opts.Value;
            user = userContext;
        }

        public async Task<PatientDemographicContext> GetDemographicsAsync(DemographicCompilerContext context, CancellationToken token)
        {
            var exeContext = compiler.BuildDemographicSql(context, user.Anonymize());

            log.LogInformation("Compiled Demographic Execution Context. Context:{@Context}", exeContext);
            var demographic = await ExecuteDemographicsAsync(exeContext, token);

            return demographic;
        }

        async Task<PatientDemographicContext> ExecuteDemographicsAsync(DemographicExecutionContext context, CancellationToken token)
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
            var validationSchema = ValidationSchema.For(shape);
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
                    var exportRecord = GetExportRecord(reader);
                    var export = exportConverter(exportRecord);
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

        PatientDemographicRecord GetExportRecord(SqlDataReader reader)
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
                DeathDate = reader.GetNullableDateTime(Plan.DeathDate?.Index)
            };

            return rec;
        }
    }
}
