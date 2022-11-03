// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data;
using Dapper;
using System.Collections.Generic;

namespace Services.Tables
{
    public class ResourceUniversalIdTable : ISqlTableType
    {
        public DataTable Value
        {
            get;
            private set;
        }

        public const string Type = @"app.ResourceUniversalIdTable";
        const string universalId = @"UniversalId";

        ResourceUniversalIdTable(HashSet<string> uids)
        {
            var table = Schema();
            Fill(table, with: uids);
            Value = table;
        }

        DataTable Schema()
        {
            var dt = new DataTable();

            dt.Columns.Add(universalId, typeof(string));

            dt.SetTypeName(Type);

            return dt;
        }

        void Fill(DataTable table, HashSet<string> with)
        {
            foreach (var w in with)
            {
                var row = table.NewRow();
                row[universalId] = w;
                table.Rows.Add(row);
            }
        }

        public static DataTable From(HashSet<string> uids)
        {
            return new ResourceUniversalIdTable(uids).Value;
        }
    }
}
