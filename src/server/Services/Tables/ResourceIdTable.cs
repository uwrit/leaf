// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data;
using Dapper;
using System.Collections.Generic;
using System.Linq;

namespace Services.Tables
{
    public class ResourceIdTable : ISqlTableType
    {
        public DataTable Value
        {
            get;
            private set;
        }

        public const string Type = @"app.ResourceIdTable";
        const string id = @"Id";

        ResourceIdTable(HashSet<Guid> ids)
        {
            var table = Schema();
            Fill(table, with: ids);
            Value = table;
        }

        DataTable Schema()
        {
            var dt = new DataTable();

            dt.Columns.Add(id, typeof(Guid));

            dt.SetTypeName(Type);

            return dt;
        }

        void Fill(DataTable table, HashSet<Guid> with)
        {
            foreach (var w in with)
            {
                var row = table.NewRow();
                row[id] = w;
                table.Rows.Add(row);
            }
        }

        public static DataTable From(HashSet<Guid> ids)
        {
            return new ResourceIdTable(ids).Value;
        }

        public static DataTable From(IEnumerable<Guid> ids)
        {
            return From(ids.ToHashSet());
        }
    }
}
