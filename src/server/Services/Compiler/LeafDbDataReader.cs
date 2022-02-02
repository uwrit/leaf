// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Threading.Tasks;
using System.Linq;
using Google.Cloud.BigQuery.V2;
using Model.Compiler;
using System.Collections.ObjectModel;

namespace Services.Compiler
{
    public class WrappedDbDataReader : ILeafDbDataReader
    {
        readonly DbConnection conn;
        readonly DbDataReader reader;

        public WrappedDbDataReader(DbConnection conn, DbDataReader reader)
        {
            this.reader = reader;
            this.conn = conn;
        }

        public object this[int i]
        {
            get => reader[i];
        }

        
        public async Task CloseAsync()
        {
            if (!reader.IsClosed)
            {
                await reader.CloseAsync();
            }
            if (conn.State == System.Data.ConnectionState.Open)
            {
                await conn.CloseAsync();
            }
        }

        public bool Read()                                     => reader.Read();
        public IReadOnlyCollection<DbColumn> GetColumnSchema() => reader.GetColumnSchema();

        public string GetNullableString(int index)      => reader.IsDBNull(index) ? null : reader.GetString(index);
        public Guid? GetNullableGuid(int index)         => reader.IsDBNull(index) ? null : reader.GetGuid(index);
        public DateTime? GetNullableDateTime(int index) => reader.IsDBNull(index) ? null : reader.GetDateTime(index);
        public bool GetBoolean(int index)               => reader.GetBoolean(index);
        public bool? GetNullableBoolean(int index)      => reader.IsDBNull(index) ? null : reader.GetBoolean(index);
        public int? GetNullableInt(int index)           => reader.IsDBNull(index) ? null : reader.GetInt32(index);
        public object GetNullableObject(int index)      => reader.IsDBNull(index) ? null : reader.GetValue(index);

        public string GetNullableString(int? index)
        {
            if (index.HasValue) return GetNullableString(index.Value);
            return null;
        }

        public Guid? GetNullableGuid(int? index)
        {
            if (index.HasValue) return GetNullableGuid(index.Value);
            return null;
        }

        public DateTime? GetNullableDateTime(int? index)
        {
            if (index.HasValue) return GetNullableDateTime(index.Value);
            return null;
        }

        public bool? GetNullableBoolean(int? index)
        {
            if (index.HasValue) return GetNullableBoolean(index.Value);
            return null;
        }

        public int? GetNullableInt(int? index)
        {
            if (index.HasValue) return GetNullableInt(index.Value);
            return null;
        }

        public object GetNullableObject(int? index)
        {
            if (index.HasValue) return GetNullableObject(index.Value);
            return null;
        }
    }

    public class BigQueryWrappedDbReader : ILeafDbDataReader
    {
        public class BigQueryDbColumn : DbColumn
        {
            public BigQueryDbColumn(Google.Apis.Bigquery.v2.Data.TableFieldSchema field, int index)
            {
                ColumnName = field.Name;
                DataTypeName = field.Type;
                ColumnOrdinal = index;
            }
        }

        readonly BigQueryResults results;
        BigQueryRow row;
        int rowIndex;
        int totalRows;

        public object this[int i]
        {
            get => row[i];
        }

        public BigQueryWrappedDbReader(BigQueryResults results)
        {
            this.results = results;
            this.totalRows = Convert.ToInt32(results.TotalRows);
        }

        public bool Read()
        {
            if (rowIndex < totalRows)
            {
                rowIndex++;
                row = results.ElementAt(rowIndex);
                return true;
            }
            return false;
        }

        public async Task CloseAsync()
        {
            // noop
        }

        public IReadOnlyCollection<DbColumn> GetColumnSchema()
        {
            var cols = results.Schema.Fields.Select((f, i) => new BigQueryDbColumn(f, i));
            return new ReadOnlyCollection<BigQueryDbColumn>(cols.ToArray());
        }

        public string GetNullableString(int index)      => row[index] is string @val ? @val : null;
        public Guid? GetNullableGuid(int index)         => row[index] is Guid @val ? @val : null;
        public DateTime? GetNullableDateTime(int index) => row[index] is DateTime @val ? @val : null;
        public bool GetBoolean(int index)               => (bool)row[index];
        public bool? GetNullableBoolean(int index)      => row[index] is bool @val ? @val : null;
        public int? GetNullableInt(int index)           => row[index] is int @val ? @val : null;
        public object GetNullableObject(int index)      => row[index] ?? null;

        public string GetNullableString(int? index)
        {
            if (index.HasValue) return GetNullableString(index.Value);
            return null;
        }

        public Guid? GetNullableGuid(int? index)
        {
            if (index.HasValue) return GetNullableGuid(index.Value);
            return null;
        }

        public DateTime? GetNullableDateTime(int? index)
        {
            if (index.HasValue) return GetNullableDateTime(index.Value);
            return null;
        }

        public bool? GetNullableBoolean(int? index)
        {
            if (index.HasValue) return GetNullableBoolean(index.Value);
            return null;
        }

        public int? GetNullableInt(int? index)
        {
            if (index.HasValue) return GetNullableInt(index.Value);
            return null;
        }

        public object GetNullableObject(int? index)
        {
            if (index.HasValue) return GetNullableObject(index.Value);
            return null;
        }
    }
}
