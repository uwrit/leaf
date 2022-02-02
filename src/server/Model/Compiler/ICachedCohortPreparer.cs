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

namespace Model.Compiler
{
    public interface ICachedCohortPreparer
    {
        public string FieldInternalPersonId { get; set; }
        public string TempTableName { get; set; }
        public Task<string> Prepare(Guid queryId, bool exportedOnly);
        public string CohortToCte();
    }

    public abstract class BaseCachedCohortPreparer : ICachedCohortPreparer
    {
        public string FieldInternalPersonId { get; set; } = "__personId__";
        public string TempTableName { get; set; } = "__cohort__";
        readonly internal ICachedCohortFetcher cohortFetcher;
        readonly internal CompilerOptions compilerOpts;
        readonly internal int batchSize = 1000;
        internal bool exportedOnly;

        internal string InsertDelimited(CachedCohortRecord rec, string delimeter = "'")
        {
            return $"{delimeter}{rec.PersonId}{delimeter}, {rec.Exported}, {delimeter}{rec.Salt}{delimeter}";
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

        public BaseCachedCohortPreparer(ICachedCohortFetcher cohortFetcher, CompilerOptions compilerOpts)
        {
            this.cohortFetcher = cohortFetcher;
            this.compilerOpts = compilerOpts;
        }

        public virtual async Task<string> Prepare(Guid queryId, bool exportedOnly) => ""; // no-op

        public virtual string CohortToCte()
        {
            return
                $"SELECT {FieldInternalPersonId} = PersonId, Exported, Salt " +
                $"FROM {TempTableName} ";
        }
    }

    public class SharedSqlServerCachedCohortPreparer : BaseCachedCohortPreparer
    {
        public SharedSqlServerCachedCohortPreparer(
            ICachedCohortFetcher cohortFetcher,
            CompilerOptions compilerOpts)
            : base(cohortFetcher, compilerOpts) { }

        public override async Task<string> Prepare(Guid queryId, bool exportedOnly)
        {
            this.exportedOnly = exportedOnly;
            return "";
        }

        public override string CohortToCte()
        {
            var output = new StringBuilder();
            output.Append($"SELECT {FieldInternalPersonId} = PersonId, Exported, Salt ");
            output.Append($"FROM {compilerOpts.AppDb}.app.Cohort ");
            output.Append($"WHERE QueryId = {ShapedDatasetCompilerContext.QueryIdParam} ");

            if (exportedOnly)
            {
                output.Append(" AND Exported = 1");
            }

            return output.ToString();
        }
    }

    // SQL Server
    public class SqlServerCachedCohortPreparer : BaseCachedCohortPreparer
    {
        readonly ISqlDialect dialect = new TSqlDialect();

        public SqlServerCachedCohortPreparer(ICachedCohortFetcher cohortFetcher, CompilerOptions compilerOpts)
            : base(cohortFetcher, compilerOpts) { }

        public async override Task<string> Prepare(Guid queryId, bool exportedOnly)
        {
            var output = new StringBuilder();
            var cohort = await cohortFetcher.FetchCohortAsync(queryId, exportedOnly);

            output.Append(@$"CREATE TABLE #{TempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)};"
            );

            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO #{TempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimited(r) + ")"))};");
                output.AppendLine();
            }

            return output.ToString();
        }

        public override string CohortToCte()
        {
            return $"SELECT {FieldInternalPersonId} = PersonId, Exported, Salt FROM #{TempTableName}";
        }
    }

    // MySQL
    public class MySqlCachedCohortPreparer : BaseCachedCohortPreparer
    {
        readonly ISqlDialect dialect = new MySqlDialect();

        public MySqlCachedCohortPreparer(ICachedCohortFetcher cohortFetcher, CompilerOptions compilerOpts)
            : base(cohortFetcher, compilerOpts) { }

        public async override Task<string> Prepare(Guid queryId, bool exportedOnly)
        {
            var output = new StringBuilder();
            var cohort = await cohortFetcher.FetchCohortAsync(queryId, exportedOnly);

            output.Append(@$"CREATE TEMPORARY TABLE {TempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)};"
            );

            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO {TempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimited(r) + ")"))};");
                output.AppendLine();
            }

            return output.ToString();
        }
    }

    // MariaDB
    public class MariaDbCachedCohortPreparer : MySqlCachedCohortPreparer
    {
        public MariaDbCachedCohortPreparer(ICachedCohortFetcher cohortFetcher, CompilerOptions compilerOpts)
            : base(cohortFetcher, compilerOpts) { }
    }

    // Oracle
    public class OracleCachedCohortPreparer : BaseCachedCohortPreparer
    {
        readonly ISqlDialect dialect = new PlSqlDialect();

        public OracleCachedCohortPreparer(ICachedCohortFetcher cohortFetcher, CompilerOptions compilerOpts)
            : base(cohortFetcher, compilerOpts) { }

        public async override Task<string> Prepare(Guid queryId, bool exportedOnly)
        {
            var output = new StringBuilder();
            var cohort = await cohortFetcher.FetchCohortAsync(queryId, exportedOnly);

            output.Append(@$"CREATE TEMPORARY TABLE ORA${TempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)};"
            );

            output.Append(" INSERT ALL ");

            foreach (var rec in cohort)
            {
                output.Append($"INTO ORA${TempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES ({InsertDelimited(rec)})");
                output.AppendLine();
            }

            output.Append(" SELECT 1 FROM DUAL; ");

            return output.ToString();
        }

        public override string CohortToCte()
        {
            return $"SELECT {FieldInternalPersonId} = PersonId, Exported, Salt FROM ORA${TempTableName}";
        }
    }

    // PostgreSQL
    public class PostgreSqlCachedCohortPreparer : BaseCachedCohortPreparer
    {
        readonly ISqlDialect dialect = new PostgreSqlDialect();

        public PostgreSqlCachedCohortPreparer(ICachedCohortFetcher cohortFetcher, CompilerOptions compilerOpts)
            : base(cohortFetcher, compilerOpts) { }

        public async override Task<string> Prepare(Guid queryId, bool exportedOnly)
        {
            var output = new StringBuilder();
            var cohort = await cohortFetcher.FetchCohortAsync(queryId, exportedOnly);

            output.Append(@$"CREATE TEMPORARY TABLE {TempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)};"
            );

            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO {TempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimited(r) + ")"))};");
                output.AppendLine();
            }

            return output.ToString();
        }
    }

    // BigQuery
    public class BigQuerySqlCachedCohortPreparer : BaseCachedCohortPreparer
    {
        readonly ISqlDialect dialect = new BigQuerySqlDialect();

        public BigQuerySqlCachedCohortPreparer(ICachedCohortFetcher cohortFetcher, CompilerOptions compilerOpts)
            : base(cohortFetcher, compilerOpts) { }

        public async override Task<string> Prepare(Guid queryId, bool exportedOnly)
        {
            var output = new StringBuilder();
            var cohort = await cohortFetcher.FetchCohortAsync(queryId, exportedOnly);

            output.Append(@$"CREATE TEMPORARY TABLE {TempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)};"
            );

            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO {TempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimited(r) + ")"))};");
                output.AppendLine();
            }

            return output.ToString();
        }
    }
}
