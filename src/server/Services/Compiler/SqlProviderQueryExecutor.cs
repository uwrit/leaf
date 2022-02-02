// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data.SqlClient;
using System.Threading;
using System.Threading.Tasks;
using Model.Compiler;
using Google.Cloud.BigQuery.V2;

namespace Services.Compiler
{
    /**
     * SQL Server
     */
    public class SqlServerQueryExecutor : ISqlProviderQueryExecutor
    {
        public async Task<ILeafDbDataReader> ExecuteReaderAsync(string connStr, string query, int timeout, CancellationToken token)
        {
            var conn = new SqlConnection(connStr);
            await conn.OpenAsync();

            var cmd = new SqlCommand(query, conn) { CommandTimeout = timeout };
            var reader = await cmd.ExecuteReaderAsync(token);

            return new WrappedDbDataReader(conn, reader);
        }
    }

    /**
     * MySQL
     */
    public class MySqlQueryExecutor : ISqlProviderQueryExecutor
    {
        public async Task<ILeafDbDataReader> ExecuteReaderAsync(string connStr, string query, int timeout, CancellationToken token)
        {
            var conn = new MySql.Data.MySqlClient.MySqlConnection(connStr);
            await conn.OpenAsync();

            var cmd = new MySql.Data.MySqlClient.MySqlCommand(query, conn) { CommandTimeout = timeout };
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
    public class PostgreSqlQueryExecutor : ISqlProviderQueryExecutor
    {
        public async Task<ILeafDbDataReader> ExecuteReaderAsync(string connStr, string query, int timeout, CancellationToken token)
        {
            var conn = new Npgsql.NpgsqlConnection(connStr);
            await conn.OpenAsync();

            var cmd = new Npgsql.NpgsqlCommand(query, conn) { CommandTimeout = timeout };
            var reader = await cmd.ExecuteReaderAsync(token);

            return new WrappedDbDataReader(conn, reader);
        }
    }

    /**
     * Oracle
     */
    public class OracleQueryExecutor : ISqlProviderQueryExecutor
    {
        public async Task<ILeafDbDataReader> ExecuteReaderAsync(string connStr, string query, int timeout, CancellationToken token)
        {
            var conn = new System.Data.OracleClient.OracleConnection(connStr);
            await conn.OpenAsync();

            var cmd = new System.Data.OracleClient.OracleCommand(query, conn) { CommandTimeout = timeout };
            var reader = await cmd.ExecuteReaderAsync(token);

            return new WrappedDbDataReader(conn, reader);
        }
    }

    /**
     * Google BigQuery
     */
    public class BigQueryQueryExecutor : ISqlProviderQueryExecutor
    {
        /*
        public async Task<HashSet<string>> ExecuteCohortQueryAsync(string projectId, string query, int timeout, CancellationToken token)
        {
            var output = new HashSet<string>();
            var client = await BigQueryClient.CreateAsync(projectId);
            var results = await client.ExecuteQueryAsync(query, parameters: null);

            foreach (var row in results)
            {
                output.Add(row[0].ToString());
            }

            return output;
        }
        */

        public async Task<ILeafDbDataReader> ExecuteReaderAsync(string projectId, string query, int timeout, CancellationToken token)
        {
            var client = await BigQueryClient.CreateAsync(projectId);
            var results = await client.ExecuteQueryAsync(query, parameters: null);

            return new BigQueryWrappedDbReader(results);
        }
    }
}
