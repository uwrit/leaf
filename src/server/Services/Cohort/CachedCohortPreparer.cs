// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using Model.Cohort;
using Model.Options;
using Model.Compiler.SqlBuilder;
using Model.Compiler;
using Microsoft.Extensions.Options;

namespace Services.Cohort
{
    public abstract class BaseCachedCohortPreparer : ICachedCohortPreparer
    {
        public string FieldInternalPersonId { get; set; } = "__personId__";
        public string TempTableName { get; set; } = "__cohort__";

        readonly internal ICachedCohortFetcher cohortFetcher;
        readonly internal ISqlDialect dialect;
        readonly internal CompilerOptions compilerOpts;
        readonly internal int batchSize = 1000;

        internal Guid queryId;
        internal bool exportedOnly;
        internal string personId;
        internal Func<Task<IEnumerable<CachedCohortRecord>>> GetCohort;

        public BaseCachedCohortPreparer(
            ICachedCohortFetcher cohortFetcher,
            ISqlDialect dialect,
            IOptions<CompilerOptions> compilerOpts)
        {
            this.cohortFetcher = cohortFetcher;
            this.dialect = dialect;
            this.compilerOpts = compilerOpts.Value;
        }

        internal virtual string PersonIdTransformHandler(string patientId) => patientId;
        internal virtual string ExportedTransformHandler(bool exported) => exported ? "1" : "0";
        internal virtual string SaltTransformHandler(Guid salt) => salt.ToString();

        readonly string[] invalidChars = new string[] { "'", " ", "`" };
        internal void ValidatePatientId(string patientId)
        {
            var validCharsOnly = !invalidChars.Any(c => patientId.Contains(c));

            if (!validCharsOnly || patientId.Length == 0)
            {
                throw new LeafCompilerException("PatientId contains illegal characters or is an empty string");
            }
        }

        internal virtual string InsertDelimitedRow(CachedCohortRecord rec, string delim = "'")
        {
            var personId = PersonIdTransformHandler(rec.PersonId);
            var exported = ExportedTransformHandler(rec.Exported);
            var salt = SaltTransformHandler(rec.Salt);

            ValidatePatientId(personId);

            return $"{delim}{personId}{delim}, {exported}, {delim}{salt}{delim}";
        }

        internal IEnumerable<IEnumerable<T>> Batch<T>(IEnumerable<T> vals, int batchSize)
        {
            int total = 0;
            while (total < vals.Count())
            {
                yield return vals.Skip(total).Take(batchSize);
                total += batchSize;
            }
        }

        internal async Task<IEnumerable<CachedCohortRecord>> FetchCohortAsync()
        {
            return await cohortFetcher.FetchCohortAsync(queryId, exportedOnly);
        }

        internal async Task<IEnumerable<CachedCohortRecord>> FetchPatientInCohortAsync()
        {
            var patient = await cohortFetcher.FetchPatientByCohortAsync(queryId, personId);
            return new CachedCohortRecord[] { patient };
        }

        public async Task SetQueryCohort(Guid queryId, bool exportedOnly)
        {
            this.queryId = queryId;
            this.exportedOnly = exportedOnly;
            GetCohort = () => FetchCohortAsync();
        }

        public virtual async Task<string> Prepare() => string.Empty; // no-op

        public virtual string CohortToCteFrom() => TempTableName;

        public virtual string CohortToCteWhere() => null;

        public virtual string CohortToCte()
        {
            return
                $"SELECT PersonId AS {FieldInternalPersonId}, Exported, Salt " +
                $"FROM {CohortToCteFrom()}";
        }

        public virtual string Complete() => string.Empty;
    }

    public class SharedSqlServerCachedCohortPreparer : BaseCachedCohortPreparer
    {
        public SharedSqlServerCachedCohortPreparer(
            ICachedCohortFetcher cohortFetcher,
            ISqlDialect dialect,
            IOptions<CompilerOptions> compilerOpts)
            : base(cohortFetcher, dialect, compilerOpts) { }

        public async Task SetQuerySinglePatient(Guid queryId, string personId)
        {
            this.queryId = queryId;

            var patient = await cohortFetcher.FetchPatientByCohortAsync(queryId, personId);
            if (patient == null) throw new LeafCompilerException("Patient does not exist in cohort or is not exported.");
            ValidatePatientId(patient.PersonId);

            this.personId = patient.PersonId;
        }

        public override string CohortToCteFrom() => $"{compilerOpts.AppDb}.app.Cohort";

        public override string CohortToCteWhere()
        {
            var output = new StringBuilder();
            output.Append($"QueryId = @{ShapedDatasetCompilerContext.QueryIdParam}");

            if (exportedOnly)
            {
                output.Append(" AND Exported = 1");
            }

            return output.ToString();
        }

        public override string CohortToCte()
        {
            return $"SELECT PersonId AS {FieldInternalPersonId}, Exported, Salt FROM {CohortToCteFrom()} WHERE {CohortToCteWhere()}";
        }
    }

    // SQL Server
    public class SqlServerCachedCohortPreparer : BaseCachedCohortPreparer
    {
        public SqlServerCachedCohortPreparer(
            ICachedCohortFetcher cohortFetcher,
            ISqlDialect dialect,
            IOptions<CompilerOptions> compilerOpts)
            : base(cohortFetcher, dialect, compilerOpts) { }

        public async override Task<string> Prepare()
        {
            var output = new StringBuilder();
            var cohort = await GetCohort();

            output.Append(@$"CREATE TABLE #{TempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)});"
            );
            output.AppendLine();

            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO #{TempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimitedRow(r) + ")"))};");
                output.AppendLine();
            }

            return output.ToString();
        }

        public override string CohortToCteFrom() => $"#{TempTableName}";

        public override string CohortToCte() => $"SELECT PersonId AS {FieldInternalPersonId}, Exported, Salt FROM {CohortToCteFrom()}";

        public override string Complete() => $"DROP TABLE #{TempTableName}";
    }

    // MySQL
    public class MySqlCachedCohortPreparer : BaseCachedCohortPreparer
    {
        public MySqlCachedCohortPreparer(
            ICachedCohortFetcher cohortFetcher,
            ISqlDialect dialect,
            IOptions<CompilerOptions> compilerOpts)
            : base(cohortFetcher, dialect, compilerOpts) { }

        public async override Task<string> Prepare()
        {
            var output = new StringBuilder();
            var cohort = await GetCohort();

            // Create temp table
            output.Append(@$"CREATE TEMPORARY TABLE {TempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)});"
            );
            output.AppendLine();

            // Add Index
            output.Append($"CREATE INDEX IDX_TEMP1 ON {TempTableName} (PersonId);");
            output.AppendLine();

            // Insert rows
            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO {TempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimitedRow(r) + ")"))};");
                output.AppendLine();
            }

            return output.ToString();
        }

        public override string Complete() => $"; DROP TABLE IF EXISTS {TempTableName}";
    }

    // MariaDB
    public class MariaDbCachedCohortPreparer : MySqlCachedCohortPreparer
    {
        public MariaDbCachedCohortPreparer(
            ICachedCohortFetcher cohortFetcher,
            ISqlDialect dialect,
            IOptions<CompilerOptions> compilerOpts)
            : base(cohortFetcher, dialect, compilerOpts) { }
    }

    // Oracle
    public class OracleCachedCohortPreparer : BaseCachedCohortPreparer
    {
        public OracleCachedCohortPreparer(
            ICachedCohortFetcher cohortFetcher,
            ISqlDialect dialect,
            IOptions<CompilerOptions> compilerOpts)
            : base(cohortFetcher, dialect, compilerOpts) { }

        public async override Task<string> Prepare()
        {
            var output = new StringBuilder();
            var cohort = await GetCohort();

            output.Append(@$"CREATE TEMPORARY TABLE ORA${TempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)});"
            );
            output.AppendLine();

            output.Append(" INSERT ALL ");
            output.AppendLine();

            foreach (var rec in cohort)
            {
                output.Append($"INTO ORA${TempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES ({InsertDelimitedRow(rec)})");
                output.AppendLine();
            }

            output.Append(" SELECT 1 FROM DUAL; ");

            return output.ToString();
        }

        public override string CohortToCteFrom() => $"ORA${TempTableName}";

        public override string CohortToCte()
        {
            return $"SELECT PersonId AS {FieldInternalPersonId}, Exported, Salt FROM {CohortToCteFrom()}";
        }
    }

    // PostgreSQL
    public class PostgreSqlCachedCohortPreparer : BaseCachedCohortPreparer
    {
        public PostgreSqlCachedCohortPreparer(
            ICachedCohortFetcher cohortFetcher,
            ISqlDialect dialect,
            IOptions<CompilerOptions> compilerOpts)
            : base(cohortFetcher, dialect, compilerOpts) { }

        internal override string ExportedTransformHandler(bool exported) => exported ? "TRUE" : "FALSE";

        public async override Task<string> Prepare()
        {
            var output = new StringBuilder();
            var cohort = await GetCohort();

            // Create temp table
            output.Append(@$"CREATE TEMPORARY TABLE {TempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)});"
            );
            output.AppendLine();

            // Add Index
            output.Append($"CREATE INDEX IDX_TEMP1 ON {TempTableName} (PersonId);");
            output.AppendLine();

            // Insert rows
            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO {TempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimitedRow(r) + ")"))};");
                output.AppendLine();
            }

            return output.ToString();
        }

        public override string Complete() => $"; DROP TABLE IF EXISTS {TempTableName}";
    }

    // BigQuery
    public class BigQuerySqlCachedCohortPreparer : BaseCachedCohortPreparer
    {
        public BigQuerySqlCachedCohortPreparer(
            ICachedCohortFetcher cohortFetcher,
            ISqlDialect dialect,
            IOptions<CompilerOptions> compilerOpts)
            : base(cohortFetcher, dialect, compilerOpts) { }

        public async override Task<string> Prepare()
        {
            var output = new StringBuilder();
            var cohort = await GetCohort();

            output.Append(@$"CREATE TEMPORARY TABLE {TempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)});"
            );
            output.AppendLine();

            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO {TempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimitedRow(r) + ")"))};");
                output.AppendLine();
            }

            return output.ToString();
        }
    }
}
