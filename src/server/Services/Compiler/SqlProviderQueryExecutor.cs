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
            IEnumerable<QueryParameter> parameters)
        {
            return null;
        }
    }

    /**
     * SQL Server
     */
    public class SqlServerQueryExecutor : BaseQueryExecutor
    {
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
            cmd.Parameters.AddRange(parameters.Select(p => new SqlParameter(p.Name, p.Value)).ToArray());

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
            cmd.Parameters.AddRange(parameters.Select(p => new MySql.Data.MySqlClient.MySqlParameter(p.Name, p.Value)).ToArray());

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
            cmd.Parameters.AddRange(parameters.Select(p => new Npgsql.NpgsqlParameter(p.Name, p.Value)).ToArray());

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
            cmd.Parameters.AddRange(parameters.Select(p => new System.Data.OracleClient.OracleParameter(p.Name, p.Value)).ToArray());

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
        public override async Task<ILeafDbDataReader> ExecuteReaderAsync(
            string projectId,
            string query,
            int timeout,
            CancellationToken token,
            IEnumerable<QueryParameter> parameters)
        {
            var client = await BigQueryClient.CreateAsync(projectId);
            var results = await client.ExecuteQueryAsync(query, parameters: null);

            // TODO(ndobb) handle parameters

            return new BigQueryWrappedDbReader(results);
        }
    }
}
