// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Data.SqlClient;
using System.Threading;
using System.Threading.Tasks;
using Model.Compiler;
using Google.Cloud.BigQuery.V2;

namespace Services.Compiler
{
    public abstract class BaseSqlProviderQueryExecutor
    {
        internal async Task<HashSet<string>> ExecuteCohortQueryAsync(DbConnection conn, DbCommand cmd, CancellationToken token)
        {
            var output = new HashSet<string>();
            await conn.OpenAsync();
            using (var reader = await cmd.ExecuteReaderAsync(token))
            {
                while (reader.Read())
                {
                    output.Add(reader[0].ToString());
                }
            }
            await conn.CloseAsync();
            return output;
        }
    }

    /**
     * SQL Server
     */
    public class SqlServerQueryExecutor : BaseSqlProviderQueryExecutor, ISqlProviderQueryExecutor
    {
        public async Task<HashSet<string>> ExecuteCohortQueryAsync(string connStr, string query, int timeout, CancellationToken token)
        {
            var conn = new SqlConnection(connStr);
            var cmd = new SqlCommand(query, conn);
            cmd.CommandTimeout = timeout;

            return await ExecuteCohortQueryAsync(conn, cmd, token);
        }
    }

    /**
     * MySQL
     */
    public class MySqlQueryExecutor : BaseSqlProviderQueryExecutor, ISqlProviderQueryExecutor
    {
        public async Task<HashSet<string>> ExecuteCohortQueryAsync(string connStr, string query, int timeout, CancellationToken token)
        {
            var conn = new MySql.Data.MySqlClient.MySqlConnection(connStr);
            var cmd = new MySql.Data.MySqlClient.MySqlCommand(query, conn);
            cmd.CommandTimeout = timeout;

            return await ExecuteCohortQueryAsync(conn, cmd, token);
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
    public class PostgreSqlQueryExecutor : BaseSqlProviderQueryExecutor, ISqlProviderQueryExecutor
    {
        public async Task<HashSet<string>> ExecuteCohortQueryAsync(string connStr, string query, int timeout, CancellationToken token)
        {
            var conn = new Npgsql.NpgsqlConnection(connStr);
            var cmd = new Npgsql.NpgsqlCommand(query, conn);
            cmd.CommandTimeout = timeout;

            return await ExecuteCohortQueryAsync(conn, cmd, token);
        }
    }

    /**
     * Oracle
     */
    public class OracleQueryExecutor : BaseSqlProviderQueryExecutor, ISqlProviderQueryExecutor
    {
        public async Task<HashSet<string>> ExecuteCohortQueryAsync(string connStr, string query, int timeout, CancellationToken token)
        {
            var conn = new System.Data.OracleClient.OracleConnection(connStr);
            var cmd = new System.Data.OracleClient.OracleCommand(query, conn);
            cmd.CommandTimeout = timeout;

            return await ExecuteCohortQueryAsync(conn, cmd, token);
        }
    }

    /**
     * Google BigQuery
     */
    public class BigQueryQueryExecutor : ISqlProviderQueryExecutor
    {
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
    }
}
