﻿// Copyright (c) 2022, UW Medicine Research IT, University of Washington
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
using Microsoft.Extensions.Options;
using Model.Compiler;

namespace Services.Cohort
{
    public abstract class BaseCachedCohortPreparer : ICachedCohortPreparer
    {
        public string FieldInternalPersonId { get; set; } = "__personId__";
        public string FieldPersonId { get; set; } = "PersonId";
        public string FieldExported { get; set; } = "Exported";
        public string FieldSalt { get; set; } = "Salt";
        public string FieldQueryId { get; set; } = "QueryId";
        public string TempTableName { get; set; } = "__cohort__";

        readonly internal ICachedCohortFetcher cohortFetcher;
        readonly internal ISqlDialect dialect;
        readonly internal CompilerOptions compilerOpts;
        readonly internal int batchSize = 1000;
        internal bool exportedOnly;

        public BaseCachedCohortPreparer(
            ICachedCohortFetcher cohortFetcher,
            ISqlDialect dialect,
            IOptions<CompilerOptions> compilerOpts)
        {
            this.cohortFetcher = cohortFetcher;
            this.dialect = dialect;
            this.compilerOpts = compilerOpts.Value;
        }

        internal virtual string PersonIdTransformHandler(string personId, string delim) => $"{delim}{personId}{delim}";
        internal virtual string ExportedTransformHandler(bool exported) => exported ? "1" : "0";
        internal virtual string GuidTransformHandler(Guid? salt, string delim) => salt.HasValue ? $"{delim}{salt}{delim}" : "null";

        internal virtual string InsertDelimitedRow(CachedCohortRecord rec, string delim = "'")
        {
            var personId = PersonIdTransformHandler(rec.PersonId, delim);
            var exported = ExportedTransformHandler(rec.Exported);
            var salt = GuidTransformHandler(rec.Salt, delim);
            var qid = GuidTransformHandler(rec.QueryId, delim);

            return $"{personId}, {exported}, {salt}, {qid}";
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

        public virtual async Task<string> Prepare(Guid queryId, bool exportedOnly) => ""; // no-op

        public virtual async Task<string> Prepare(IEnumerable<Guid> queryId, bool exportedOnly) => ""; // no-op

        public virtual string CohortToCteFrom() => TempTableName;

        public virtual string CohortToCteWhere() => ""; // no-op

        public virtual string CohortToCte()
        {
            return
                $"SELECT {FieldPersonId} AS {FieldInternalPersonId}, {FieldExported}, {FieldSalt} " +
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

        public override async Task<string> Prepare(Guid queryId, bool exportedOnly)
        {
            this.exportedOnly = exportedOnly;
            return "";
        }

        public override string CohortToCteFrom() => $"{compilerOpts.AppDb}.app.Cohort";

        public override string CohortToCteWhere()
        {
            var output = new StringBuilder();
            output.Append($"{FieldQueryId} = @{ShapedDatasetCompilerContext.QueryIdParam}");

            if (exportedOnly)
            {
                output.Append($" AND {FieldExported} = 1");
            }

            return output.ToString();
        }

        public override string CohortToCte()
        {
            return $"SELECT {FieldPersonId} AS {FieldInternalPersonId}, {FieldExported}, {FieldSalt} FROM {CohortToCteFrom()} WHERE {CohortToCteWhere()}";
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

        public async override Task<string> Prepare(Guid queryId, bool exportedOnly)
        {
            return await Prepare(new Guid[] { queryId }, exportedOnly);
        }

        public async override Task<string> Prepare(IEnumerable<Guid> queryIds, bool exportedOnly)
        {
            var output = new StringBuilder();
            var cohort = (await Task.WhenAll(queryIds
                .Select(qid => cohortFetcher.FetchCohortAsync(qid, exportedOnly))))
                .SelectMany(x => x);

            output.Append(@$"CREATE TABLE #{TempTableName} (
                {FieldPersonId} {dialect.ToSqlType(ColumnType.String)},
                {FieldExported} {dialect.ToSqlType(ColumnType.Boolean)},
                {FieldSalt}     {dialect.ToSqlType(ColumnType.Guid)}
                {FieldQueryId}  {dialect.ToSqlType(ColumnType.Guid)});"
            );
            output.AppendLine();

            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO #{TempTableName} ({FieldPersonId}, {FieldExported}, {FieldSalt}, {FieldQueryId})");
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

        public async override Task<string> Prepare(Guid queryId, bool exportedOnly)
        {
            return await Prepare(new Guid[] { queryId }, exportedOnly);
        }

        public async override Task<string> Prepare(IEnumerable<Guid> queryIds, bool exportedOnly)
        {
            var output = new StringBuilder();
            var cohort = (await Task.WhenAll(queryIds
                .Select(qid => cohortFetcher.FetchCohortAsync(qid, exportedOnly))))
                .SelectMany(x => x);

            // Create temp table
            output.Append(@$"CREATE TEMPORARY TABLE {TempTableName} (
                {FieldPersonId} {dialect.ToSqlType(ColumnType.String)},
                {FieldExported} {dialect.ToSqlType(ColumnType.Boolean)},
                {FieldSalt}     {dialect.ToSqlType(ColumnType.Guid)},
                {FieldQueryId}  {dialect.ToSqlType(ColumnType.Guid)});"
            );
            output.AppendLine();

            // Insert rows
            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO {TempTableName} ({FieldPersonId}, {FieldExported}, {FieldSalt}, {FieldQueryId})");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimitedRow(r) + ")"))};");
                output.AppendLine();
            }

            // Add Index
            output.Append($"CREATE INDEX IDX_TEMP1 ON {TempTableName} ({FieldPersonId}, {FieldQueryId});");
            output.AppendLine();

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

        public async override Task<string> Prepare(Guid queryId, bool exportedOnly)
        {
            return await Prepare(new Guid[] { queryId }, exportedOnly);
        }

        public async override Task<string> Prepare(IEnumerable<Guid> queryIds, bool exportedOnly)
        {
            var output = new StringBuilder();
            var cohort = (await Task.WhenAll(queryIds
                .Select(qid => cohortFetcher.FetchCohortAsync(qid, exportedOnly))))
                .SelectMany(x => x);

            output.Append(@$"CREATE TEMPORARY TABLE ORA${TempTableName} (
                {FieldPersonId} {dialect.ToSqlType(ColumnType.String)},
                {FieldExported} {dialect.ToSqlType(ColumnType.Boolean)},
                {FieldSalt}     {dialect.ToSqlType(ColumnType.Guid)},
                {FieldQueryId}  {dialect.ToSqlType(ColumnType.Guid)});"
            );
            output.AppendLine();

            output.Append(" INSERT ALL ");
            output.AppendLine();

            foreach (var rec in cohort)
            {
                output.Append($"INTO ORA${TempTableName} ({FieldPersonId}, {FieldExported}, {FieldSalt}, {FieldQueryId})");
                output.Append($"VALUES ({InsertDelimitedRow(rec)})");
                output.AppendLine();
            }

            output.Append(" SELECT 1 FROM DUAL; ");

            return output.ToString();
        }

        public override string CohortToCteFrom() => $"ORA${TempTableName}";

        public override string CohortToCte()
        {
            return $"SELECT {FieldPersonId} AS {FieldInternalPersonId}, {FieldExported}, {FieldSalt} FROM {CohortToCteFrom()}";
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

        public async override Task<string> Prepare(Guid queryId, bool exportedOnly)
        {
            return await Prepare(new Guid[] { queryId }, exportedOnly);
        }

        public async override Task<string> Prepare(IEnumerable<Guid> queryIds, bool exportedOnly)
        {
            var output = new StringBuilder();
            var cohort = (await Task.WhenAll(queryIds
                .Select(qid => cohortFetcher.FetchCohortAsync(qid, exportedOnly))))
                .SelectMany(x => x);

            // Create temp table
            output.Append(@$"CREATE TEMPORARY TABLE {TempTableName} (
                {FieldPersonId} {dialect.ToSqlType(ColumnType.String)},
                {FieldExported} {dialect.ToSqlType(ColumnType.Boolean)},
                {FieldSalt}     {dialect.ToSqlType(ColumnType.Guid)},
                {FieldQueryId}  {dialect.ToSqlType(ColumnType.Guid)});"
            );
            output.AppendLine();

            // Insert rows
            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO {TempTableName} ({FieldPersonId}, {FieldExported}, {FieldSalt}, {FieldQueryId})");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimitedRow(r) + ")"))};");
                output.AppendLine();
            }

            // Add Index
            output.Append($"CREATE INDEX IDX_TEMP1 ON {TempTableName} ({FieldPersonId}, {FieldQueryId});");
            output.AppendLine();

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

        public async override Task<string> Prepare(Guid queryId, bool exportedOnly)
        {
            return await Prepare(new Guid[] { queryId }, exportedOnly);
        }

        public async override Task<string> Prepare(IEnumerable<Guid> queryIds, bool exportedOnly)
        {
            var output = new StringBuilder();
            var cohort = (await Task.WhenAll(queryIds
                .Select(qid => cohortFetcher.FetchCohortAsync(qid, exportedOnly))))
                .SelectMany(x => x);

            output.Append(@$"CREATE TEMPORARY TABLE {TempTableName} (
                {FieldPersonId} {dialect.ToSqlType(ColumnType.String)},
                {FieldExported} {dialect.ToSqlType(ColumnType.Boolean)},
                {FieldSalt}     {dialect.ToSqlType(ColumnType.Guid)},
                {FieldQueryId}  {dialect.ToSqlType(ColumnType.Guid)});"
            );
            output.AppendLine();

            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO {TempTableName} ({FieldPersonId}, {FieldExported}, {FieldSalt}, {FieldQueryId})");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimitedRow(r) + ")"))};");
                output.AppendLine();
            }

            return output.ToString();
        }
    }
}
