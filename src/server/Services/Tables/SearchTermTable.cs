// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Data;
using Dapper;

namespace Services.Tables
{
    public class SearchTermTable : ISqlTableType
    {
        public DataTable Value
        {
            get;
            private set;
        }

        public const string Type = @"app.SearchTermTable";
        const string id = @"Id";
        const string term = @"Term";

        SearchTermTable(params string[] terms)
        {
            var table = Schema();
            Fill(table, with: terms);
            Value = table;
        }

        DataTable Schema()
        {
            var dt = new DataTable();

            dt.Columns.Add(id, typeof(int));
            dt.Columns.Add(term, typeof(string));

            dt.SetTypeName(Type);

            return dt;
        }

        void Fill(DataTable table, params string[] with)
        {
            for (var i = 0; i < with.Length; i++)
            {
                var row = table.NewRow();

                row[id] = i;
                row[term] = with[i];

                table.Rows.Add(row);
            }
        }

        public static DataTable From(params string[] terms)
        {
            return new SearchTermTable(terms).Value;
        }
    }
}
