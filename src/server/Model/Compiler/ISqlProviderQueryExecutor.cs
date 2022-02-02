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
        // public Task<HashSet<string>> ExecuteCohortQueryAsync(string connStr, string query, int timeout, CancellationToken token);
        public Task<ILeafDbDataReader> ExecuteReaderAsync(string connStr, string query, int timeout, CancellationToken token);
    }

    public interface ILeafDbDataReader
    {
        public object this[int index]
        {
            get;
        }

        public Task CloseAsync();

        public bool Read();
        public IReadOnlyCollection<DbColumn> GetColumnSchema();
        public string GetNullableString(int index);
        public string GetNullableString(int? index);
        public Guid? GetNullableGuid(int index);
        public Guid? GetNullableGuid(int? index);
        public DateTime? GetNullableDateTime(int index);
        public DateTime? GetNullableDateTime(int? index);
        public bool? GetNullableBoolean(int index);
        public bool? GetNullableBoolean(int? index);
        public int? GetNullableInt(int index);
        public int? GetNullableInt(int? index);
        public object GetNullableObject(int index);
        public object GetNullableObject(int? index);
    }
}
