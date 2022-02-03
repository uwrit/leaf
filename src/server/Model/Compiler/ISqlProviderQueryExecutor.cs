// Copyright (c) 2022, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Threading;
using System.Threading.Tasks;

namespace Model.Compiler
{
    public interface ISqlProviderQueryExecutor
    {
        Task<ILeafDbDataReader> ExecuteReaderAsync(string connStr, string query, int timeout, CancellationToken token);
        Task<ILeafDbDataReader> ExecuteReaderAsync(string connStr, string query, int timeout, CancellationToken token, IEnumerable<QueryParameter> parameters);
    }

    public interface ILeafDbDataReader
    {
        public object this[int index]
        {
            get;
        }

        public object this[string colName]
        {
            get;
        }

        void Close();
        Task CloseAsync();
        bool Read();
        IEnumerable<DbColumn> GetColumnSchema();
        int GetOrdinal(string colName);
        string GetNullableString(int index);
        string GetNullableString(int? index);
        Guid GetGuid(int index);
        Guid? GetNullableCoercibleGuid(int index);
        Guid GetCoercibleGuid(int index);
        Guid? GetNullableGuid(int index);
        Guid? GetNullableGuid(int? index);
        DateTime? GetNullableDateTime(int index);
        DateTime? GetNullableDateTime(int? index);
        bool GetBoolean(int index);
        bool GetCoercibleBoolean(int index);
        bool GetCoercibleBoolean(int? index);
        bool? GetNullableCoercibleBoolean(int index);
        bool? GetNullableCoercibleBoolean(int? index);
        bool? GetNullableBoolean(int index);
        bool? GetNullableBoolean(int? index);
        int? GetNullableInt(int index);
        int? GetNullableInt(int? index);
        object GetNullableObject(int index);
        object GetNullableObject(int? index);
    }
}
