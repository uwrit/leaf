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
        public Task<string> Prepare(Guid queryId);
        public string CohortToCte();
    }

    public abstract class BaseCachedCohortPreparer : ICachedCohortPreparer
    {
        readonly internal string fieldInternalPersonId = "__personId__";
        readonly internal string tempTableName = "__cohort__";
        readonly internal ICachedCohortFetcher cohortFetcher;
        readonly internal CompilerOptions compilerOpts;

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

        public virtual async Task<string> Prepare(Guid queryId) => ""; // no-op
        public virtual string CohortToCte() => throw new NotImplementedException();
    }

    public class SharedServerCacheCohort : BaseCachedCohortPreparer
    {
        public SharedServerCacheCohort(ICachedCohortFetcher cohortFetcher, CompilerOptions compilerOpts)
            : base(cohortFetcher, compilerOpts) { }

        public override string CohortToCte()
        {
            return
                @$"SELECT {fieldInternalPersonId} = PersonId, Exported, Salt
                   FROM {compilerOpts.AppDb}.app.Cohort
                   WHERE QueryId = {ShapedDatasetCompilerContext.QueryIdParam}";
        }
    }

    // SQL Server
    public class SqlServerCachedCohortPreparer : BaseCachedCohortPreparer
    {
        readonly int batchSize = 1000;
        readonly ISqlDialect dialect = new TSqlDialect();

        public SqlServerCachedCohortPreparer(ICachedCohortFetcher cohortFetcher, CompilerOptions compilerOpts)
            : base(cohortFetcher, compilerOpts) { }

        public async override Task<string> Prepare(Guid queryId)
        {
            var output = new StringBuilder();
            var cohort = await cohortFetcher.FetchCohortAsync(queryId);

            output.Append(@$"CREATE TABLE #{tempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)};"
            );

            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO #{tempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimited(r) + ")"))};");
                output.AppendLine();
            }

            return output.ToString();
        }

        public override string CohortToCte()
        {
            return $"SELECT {fieldInternalPersonId} = PersonId, Exported, Salt FROM #{tempTableName}";
        }
    }

    // MySQL
    public class MySqlCachedCohortPreparer : BaseCachedCohortPreparer
    {
        readonly int batchSize = 1000;
        readonly ISqlDialect dialect = new MySqlDialect();

        public MySqlCachedCohortPreparer(ICachedCohortFetcher cohortFetcher, CompilerOptions compilerOpts)
            : base(cohortFetcher, compilerOpts) { }

        public async override Task<string> Prepare(Guid queryId)
        {
            var output = new StringBuilder();
            var cohort = await cohortFetcher.FetchCohortAsync(queryId);

            output.Append(@$"CREATE TEMPORARY TABLE {tempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)};"
            );

            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO {tempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimited(r) + ")"))};");
                output.AppendLine();
            }

            return output.ToString();
        }

        public override string CohortToCte()
        {
            return $"SELECT {fieldInternalPersonId} = PersonId, Exported, Salt FROM {tempTableName}";
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

        public async override Task<string> Prepare(Guid queryId)
        {
            var output = new StringBuilder();
            var cohort = await cohortFetcher.FetchCohortAsync(queryId);

            output.Append(@$"CREATE TEMPORARY TABLE ORA${tempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)};"
            );

            output.Append(" INSERT ALL ");

            foreach (var rec in cohort)
            {
                output.Append($"INTO ORA${tempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES ({InsertDelimited(rec)})");
                output.AppendLine();
            }

            output.Append(" SELECT 1 FROM DUAL; ");

            return output.ToString();
        }

        public override string CohortToCte()
        {
            return $"SELECT {fieldInternalPersonId} = PersonId, Exported, Salt FROM ORA${tempTableName}";
        }
    }

    // PostgreSQL
    public class PostgreSqlCachedCohortPreparer : BaseCachedCohortPreparer
    {
        readonly int batchSize = 1000;
        readonly ISqlDialect dialect = new PostgreSqlDialect();

        public PostgreSqlCachedCohortPreparer(ICachedCohortFetcher cohortFetcher, CompilerOptions compilerOpts)
            : base(cohortFetcher, compilerOpts) { }

        public async override Task<string> Prepare(Guid queryId)
        {
            var output = new StringBuilder();
            var cohort = await cohortFetcher.FetchCohortAsync(queryId);

            output.Append(@$"CREATE TEMPORARY TABLE {tempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)};"
            );

            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO {tempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimited(r) + ")"))};");
                output.AppendLine();
            }

            return output.ToString();
        }

        public override string CohortToCte()
        {
            return $"SELECT {fieldInternalPersonId} = PersonId, Exported, Salt FROM {tempTableName}";
        }
    }

    // BigQuery
    public class BigQuerySqlCachedCohortPreparer : BaseCachedCohortPreparer
    {
        readonly int batchSize = 1000;
        readonly ISqlDialect dialect = new BigQuerySqlDialect();

        public BigQuerySqlCachedCohortPreparer(ICachedCohortFetcher cohortFetcher, CompilerOptions compilerOpts)
            : base(cohortFetcher, compilerOpts) { }

        public async override Task<string> Prepare(Guid queryId)
        {
            var output = new StringBuilder();
            var cohort = await cohortFetcher.FetchCohortAsync(queryId);

            output.Append(@$"CREATE TEMPORARY TABLE {tempTableName} (
                PersonId {dialect.ToSqlType(ColumnType.String)},
                Exported {dialect.ToSqlType(ColumnType.Boolean)},
                Salt     {dialect.ToSqlType(ColumnType.Guid)};"
            );

            foreach (var recs in Batch(cohort, batchSize))
            {
                output.Append($"INSERT INTO {tempTableName} (PersonId, Exported, Salt)");
                output.Append($"VALUES {string.Join(',', recs.Select(r => "(" + InsertDelimited(r) + ")"))};");
                output.AppendLine();
            }

            return output.ToString();
        }

        public override string CohortToCte()
        {
            return $"SELECT {fieldInternalPersonId} = PersonId, Exported, Salt FROM {tempTableName}";
        }
    }
}
