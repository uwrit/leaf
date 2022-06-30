﻿// Copyright (c) 2022, UW Medicine Research IT, University of Washington
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

namespace Services.Compiler
{
    public class WrappedDbDataReader : ILeafDbDataReader
    {
        readonly DbConnection conn;
        readonly DbDataReader reader;
        IEnumerable<LeafDbColumn> schema;

        public WrappedDbDataReader(DbConnection conn, DbDataReader reader)
        {
            this.reader = reader;
            this.conn = conn;
            GetColumnSchema();
        }

        public object this[int i]
        {
            get => reader[i];
        }

        public object this[string colName]
        {
            get => reader[colName];
        }

        public void Close()
        {
            if (!reader.IsClosed)
            {
                reader.Close();
            }
            if (conn.State == System.Data.ConnectionState.Open)
            {
                conn.Close();
            }
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

        public IEnumerable<DbColumn> GetColumnSchema()
        {
            if (schema == null)
            {
                schema = reader.GetColumnSchema().Select((c,i) => new LeafDbColumn(c, i));
            }
            return schema;
        }

        public bool Read()                              => reader.Read();
        public int GetOrdinal(string colName)           => reader.GetOrdinal(colName);
        public string GetNullableString(int index)      => reader.IsDBNull(index) ? null : reader.GetString(index);
        public Guid GetGuid(int index)                  => reader.GetGuid(index);
        public Guid? GetNullableGuid(int index)         => reader.IsDBNull(index) ? (Guid?)null : reader.GetGuid(index);
        public DateTime? GetNullableDateTime(int index) => reader.IsDBNull(index) ? (DateTime?)null : reader.GetDateTime(index);
        public bool GetBoolean(int index)               => reader.GetBoolean(index);
        public bool? GetNullableBoolean(int index)      => reader.IsDBNull(index) ? (bool?)null : reader.GetBoolean(index);
        public int? GetNullableInt(int index)           => reader.IsDBNull(index) ? (int?)null : reader.GetInt32(index);
        public object GetNullableObject(int index)      => reader.IsDBNull(index) ? null : reader.GetValue(index);

        public Guid GetCoercibleGuid(int index)
        {
            if (schema.ElementAt(index).DataType == typeof(string))
            {
                var val = reader.GetString(index);
                return Guid.Parse(val);
            }
            return reader.GetGuid(index);
        }

        public Guid? GetNullableCoercibleGuid(int index)
        {
            if (schema.ElementAt(index).DataType == typeof(string))
            {
                var strVal = reader.GetString(index);
                var success = Guid.TryParse(strVal, out Guid guid);
                if (success)
                {
                    return guid;
                }
                return null;
            }
            return GetNullableGuid(index);
        }

        public bool GetCoercibleBoolean(int index)
        {
            if (schema.ElementAt(index).DataType == typeof(int))
            {
                var val = reader.GetInt32(index);
                if (val == 0 || val == 1)
                {
                    return Convert.ToBoolean(val);
                }
                return false;
            }
            return reader.GetBoolean(index);
        }

        public bool GetCoercibleBoolean(int? index)
        {
            if (index.HasValue) return GetCoercibleBoolean((int)index);
            return false;
        }

        public bool? GetNullableCoercibleBoolean(int index)
        {
            if (schema.ElementAt(index).DataType == typeof(int))
            {
                var val = reader.GetInt32(index);
                if (val == 0 || val == 1)
                {
                    return Convert.ToBoolean(val);
                }
                return null;
            }
            return GetNullableBoolean(index);
        }

        public bool? GetNullableCoercibleBoolean(int? index)
        {
            if (index.HasValue) return GetNullableBoolean(index);
            return null;
        }

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

        public class LeafDbColumn : DbColumn
        {
            public LeafDbColumn(DbColumn col, int index)
            {
                ColumnName = col.ColumnName;
                DataType = col.DataType;
                DataTypeName = col.DataTypeName;
                ColumnOrdinal = index;
            }
        }
    }

    public class BigQueryWrappedDbReader : ILeafDbDataReader
    {
        readonly IEnumerable<BigQueryRow> rows;
        readonly BigQueryResults results;
        Dictionary<string, int?> colByOrdinal;
        BigQueryRow row;
        int rowIndex;
        int totalRows;
        IEnumerable<BigQueryDbColumn> schema;

        public object this[int i]
        {
            get => row[i];
        }

        public object this[string colName]
        {
            get => row[colName];
        }

        public BigQueryWrappedDbReader(BigQueryResults results, IEnumerable<BigQueryRow> rows)
        {
            this.results = results;
            this.rows = rows;
            this.totalRows = Convert.ToInt32(rows.Count());
            GetColumnSchema();
        }

        public bool Read()
        {
            if (rowIndex < totalRows)
            {
                row = rows.ElementAt(rowIndex);
                rowIndex++;
                return true;
            }
            return false;
        }

        public void Close()
        {
            // noop
        }

        public async Task CloseAsync()
        {
            // noop
        }

        public IEnumerable<DbColumn> GetColumnSchema()
        {
            if (schema == null)
            {
                schema = results.Schema.Fields.Select((f, i) => new BigQueryDbColumn(f, i));
                colByOrdinal = schema.ToDictionary(c => c.ColumnName, c => c.ColumnOrdinal);
            }
            return schema;
        }

        public string GetNullableString(int index)      => row[index] is string @val ? @val : null;
        public Guid? GetNullableGuid(int index)         => row[index] is Guid @val ? @val : (Guid?)null;
        public DateTime? GetNullableDateTime(int index) => row[index] is DateTime @val ? @val : (DateTime?)null;
        public Guid GetGuid(int index)                  => Guid.Parse(row[index].ToString());
        public bool GetBoolean(int index)               => (bool)row[index];
        public bool? GetNullableBoolean(int index)      => row[index] is bool @val ? @val : (bool?)null;
        public int? GetNullableInt(int index)           => row[index] is int @val ? @val : (int?)null;
        public object GetNullableObject(int index)      => row[index] ?? null;

        public int GetOrdinal(string colName)
        {
            var found = colByOrdinal.TryGetValue(colName, out var ordinal);
            if (found) return (int)ordinal;
            return -1;
        }

        public Guid GetCoercibleGuid(int index)
        {
            return GetGuid(index);
        }

        public Guid? GetNullableCoercibleGuid(int index)
        {
            var strVal = row[index].ToString();
            if (string.IsNullOrWhiteSpace(strVal))
            {
                return null;
            }

            var success = Guid.TryParse(strVal, out Guid guid);
            if (success)
            {
                return guid;
            }
            return null;
        }

        public bool GetCoercibleBoolean(int index)
        {
            if (schema.ElementAt(index).DataType == typeof(int))
            {
                var val = (int)row[index];
                if (val == 0 || val == 1)
                {
                    return Convert.ToBoolean(val);
                }
                return false;
            }
            return (bool)row[index];
        }

        public bool GetCoercibleBoolean(int? index)
        {
            if (index.HasValue) return GetCoercibleBoolean((int)index);
            return false;
        }

        public bool? GetNullableCoercibleBoolean(int index)
        {
            if (schema.ElementAt(index).DataType == typeof(int))
            {
                var val = (int)row[index];
                if (val == 0 || val == 1)
                {
                    return Convert.ToBoolean(val);
                }
                return null;
            }
            return GetNullableBoolean(index);
        }

        public bool? GetNullableCoercibleBoolean(int? index)
        {
            if (index.HasValue) return GetNullableBoolean(index);
            return null;
        }

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

        public class BigQueryDbColumn : DbColumn
        {
            public BigQueryDbColumn(Google.Apis.Bigquery.v2.Data.TableFieldSchema field, int index)
            {
                ColumnName = field.Name;
                DataType = field.GetType();
                DataTypeName = field.Type;
                ColumnOrdinal = index;
            }
        }
    }
}
