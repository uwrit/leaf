// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading;
using System.Threading.Tasks;
using Model.Compiler;
using Google.Cloud.BigQuery.V2;

namespace Services.Compiler
{
    public abstract class BaseQueryExecutor : ISqlProviderQueryExecutor
    {
        public Task<ILeafDbDataReader> ExecuteReaderAsync(
            string connStr,
            string query,
            int timeout,
            CancellationToken token)
        {
            return ExecuteReaderAsync(connStr, query, timeout, token, new QueryParameter[] { });
        }

        public virtual Task<ILeafDbDataReader> ExecuteReaderAsync(
            string connStr,
            string query,
            int timeout,
            CancellationToken token,
            IEnumerable<QueryParameter> parameters) => null;
    }

    /**
     * SQL Server
     */
    public class SqlServerQueryExecutor : BaseQueryExecutor
    {
        System.Data.DbType ToSqlType(object val)
        {
            if (val is string)  return System.Data.DbType.String;
            if (val is decimal) return System.Data.DbType.Decimal;
            if (val is double)  return System.Data.DbType.Double;
            if (val is int)     return System.Data.DbType.Int32;
            if (val is bool)    return System.Data.DbType.Boolean;
            if (val is Guid)    return System.Data.DbType.Guid;
            return System.Data.DbType.String;
        }

        SqlParameter ToSqlParameter(QueryParameter q)
        {
            var parameter = new SqlParameter($"@{q.Name}", ToSqlType(q.Value));
            parameter.Value = q.Value;

            return parameter;
        }

        public override async Task<ILeafDbDataReader> ExecuteReaderAsync(
            string connStr,
            string query,
            int timeout,
            CancellationToken token,
            IEnumerable<QueryParameter> parameters)
        {
            // Open connection
            var conn = new SqlConnection(connStr);
            await conn.OpenAsync();

            // Create command
            var cmd = new SqlCommand(query, conn);
            cmd.CommandTimeout = timeout;
            cmd.Parameters.AddRange(parameters.Select(p => ToSqlParameter(p)).ToArray());

            // Execute reader
            var reader = await cmd.ExecuteReaderAsync(token);

            return new WrappedDbDataReader(conn, reader);
        }
    }

    /**
     * MySQL
     */
    public class MySqlQueryExecutor : BaseQueryExecutor
    {
        MySql.Data.MySqlClient.MySqlDbType ToSqlType(object val)
        {
            if (val is string)  return MySql.Data.MySqlClient.MySqlDbType.String;
            if (val is decimal) return MySql.Data.MySqlClient.MySqlDbType.Decimal;
            if (val is double)  return MySql.Data.MySqlClient.MySqlDbType.Double;
            if (val is int)     return MySql.Data.MySqlClient.MySqlDbType.Int32;
            if (val is bool)    return MySql.Data.MySqlClient.MySqlDbType.Bit;
            if (val is Guid)    return MySql.Data.MySqlClient.MySqlDbType.Guid;
            return MySql.Data.MySqlClient.MySqlDbType.String;
        }

        MySql.Data.MySqlClient.MySqlParameter ToSqlParameter(QueryParameter q)
        {
            var parameter = new MySql.Data.MySqlClient.MySqlParameter($"?{q.Name}", ToSqlType(q.Value));
            parameter.Value = q.Value;

            return parameter;
        }

        public override async Task<ILeafDbDataReader> ExecuteReaderAsync(
            string connStr,
            string query,
            int timeout,
            CancellationToken token,
            IEnumerable<QueryParameter> parameters)
        {
            // Open connection
            var conn = new MySql.Data.MySqlClient.MySqlConnection(connStr);
            await conn.OpenAsync();

            // Create command
            var cmd = new MySql.Data.MySqlClient.MySqlCommand(query, conn);
            cmd.CommandTimeout = timeout;
            cmd.Parameters.AddRange(parameters.Select(p => ToSqlParameter(p)).ToArray());

            // Execute reader
            var reader = await cmd.ExecuteReaderAsync(token);

            return new WrappedDbDataReader(conn, reader);
        }
    }

    /**
     * MariaDB
     */
    public class MariaDbQueryExecutor : MySqlQueryExecutor
    {

    }

    /**
     * PostgreSQL
     */
    public class PostgreSqlQueryExecutor : BaseQueryExecutor
    {
        NpgsqlTypes.NpgsqlDbType ToSqlType(object val)
        {
            if (val is string)  return NpgsqlTypes.NpgsqlDbType.Char;
            if (val is decimal) return NpgsqlTypes.NpgsqlDbType.Numeric;
            if (val is double)  return NpgsqlTypes.NpgsqlDbType.Numeric;
            if (val is int)     return NpgsqlTypes.NpgsqlDbType.Numeric;
            if (val is bool)    return NpgsqlTypes.NpgsqlDbType.Boolean;
            if (val is Guid)    return NpgsqlTypes.NpgsqlDbType.Uuid;
            return NpgsqlTypes.NpgsqlDbType.Char;
        }

        Npgsql.NpgsqlParameter ToSqlParameter(QueryParameter q)
        {
            var parameter = new Npgsql.NpgsqlParameter($"@{q.Name}", ToSqlType(q.Value));
            parameter.Value = q.Value;

            return parameter;
        }

        public override async Task<ILeafDbDataReader> ExecuteReaderAsync(
            string connStr,
            string query,
            int timeout,
            CancellationToken token,
            IEnumerable<QueryParameter> parameters)
        {
            // Open connection
            var conn = new Npgsql.NpgsqlConnection(connStr);
            await conn.OpenAsync();

            // Create command
            var cmd = new Npgsql.NpgsqlCommand(query, conn);
            cmd.CommandTimeout = timeout;
            cmd.Parameters.AddRange(parameters.Select(p => ToSqlParameter(p)).ToArray());

            // Execute reader
            var reader = await cmd.ExecuteReaderAsync(token);

            return new WrappedDbDataReader(conn, reader);
        }
    }

    /**
     * Oracle
     */
    public class OracleQueryExecutor : BaseQueryExecutor
    {
        System.Data.OracleClient.OracleType ToSqlType(object val)
        {
            if (val is string)  return System.Data.OracleClient.OracleType.NVarChar;
            if (val is decimal) return System.Data.OracleClient.OracleType.Float;
            if (val is double)  return System.Data.OracleClient.OracleType.Double;
            if (val is int)     return System.Data.OracleClient.OracleType.Int32;
            if (val is bool)    return System.Data.OracleClient.OracleType.Int32;
            if (val is Guid)    return System.Data.OracleClient.OracleType.NVarChar;
            return System.Data.OracleClient.OracleType.NVarChar;
        }

        System.Data.OracleClient.OracleParameter ToSqlParameter(QueryParameter q)
        {
            var parameter = new System.Data.OracleClient.OracleParameter($":{q.Name}", ToSqlType(q.Value));
            parameter.Value = q.Value;

            return parameter;
        }

        public override async Task<ILeafDbDataReader> ExecuteReaderAsync(
            string connStr,
            string query,
            int timeout,
            CancellationToken token,
            IEnumerable<QueryParameter> parameters)
        {
            // Open connection
            var conn = new System.Data.OracleClient.OracleConnection(connStr);
            await conn.OpenAsync();

            // Create command
            var cmd = new System.Data.OracleClient.OracleCommand(query, conn) { CommandTimeout = timeout };
            cmd.Parameters.AddRange(parameters.Select(p => ToSqlParameter(p)).ToArray());

            // Execute reader
            var reader = await cmd.ExecuteReaderAsync(token);

            return new WrappedDbDataReader(conn, reader);
        }
    }

    /**
     * Google BigQuery
     */
    public class BigQueryQueryExecutor : BaseQueryExecutor
    {
        BigQueryDbType ToSqlType(object val)
        {
            if (val is string)  return BigQueryDbType.String;
            if (val is decimal) return BigQueryDbType.Numeric;
            if (val is double)  return BigQueryDbType.Numeric;
            if (val is int)     return BigQueryDbType.Int64;
            if (val is bool)    return BigQueryDbType.Bool;
            if (val is Guid)    return BigQueryDbType.String;
            return BigQueryDbType.String;
        }

        BigQueryParameter ToSqlParameter(QueryParameter q)
        {
            return new BigQueryParameter(q.Name, ToSqlType(q.Value), q.Value);
        }

        public override async Task<ILeafDbDataReader> ExecuteReaderAsync(
            string projectId,
            string query,
            int timeout,
            CancellationToken token,
            IEnumerable<QueryParameter> parameters)
        {
            var client = await BigQueryClient.CreateAsync(projectId);
            var results = await client.ExecuteQueryAsync(query, parameters: parameters.Select(p => ToSqlParameter(p)));
            
            return new BigQueryWrappedDbReader(results);
        }
    }
}
