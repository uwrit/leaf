// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Data;
using Dapper;
using Model.Admin;
using System.Collections.Generic;
using Model.Admin.Compiler;

namespace Services.Tables
{
    public class SpecializationTable : ISqlTableType
    {
        public DataTable Value
        {
            get;
            private set;
        }

        public const string Type = "app.SpecializationTable";
        const string specializationGroupId = "SpecializationGroupId";
        const string universalId = "UniversalId";
        const string uiDisplayText = "UiDisplayText";
        const string sqlSetWhere = "SqlSetWhere";
        const string orderId = "OrderId";

        SpecializationTable(IEnumerable<Specialization> specs)
        {
            var table = Schema();
            Fill(table, with: specs);
            Value = table;
        }

        DataTable Schema()
        {
            var dt = new DataTable();

            dt.Columns.Add(new DataColumn(specializationGroupId, typeof(int))
            {
                AllowDBNull = true
            });
            dt.Columns.Add(new DataColumn(universalId, typeof(string))
            {
                AllowDBNull = true
            });
            dt.Columns.Add(new DataColumn(uiDisplayText, typeof(string))
            {
                AllowDBNull = true
            });
            dt.Columns.Add(new DataColumn(sqlSetWhere, typeof(string))
            {
                AllowDBNull = true
            });
            dt.Columns.Add(new DataColumn(orderId, typeof(int))
            {
                AllowDBNull = true
            });
            return dt;
        }

        void Fill(DataTable table, IEnumerable<Specialization> with)
        {
            foreach (var s in with)
            {
                var row = table.NewRow();
                row[specializationGroupId] = s.SpecializationGroupId;
                row[universalId] = s.UniversalId?.ToString();
                row[uiDisplayText] = s.UiDisplayText;
                row[sqlSetWhere] = s.SqlSetWhere;
                row[orderId] = s.OrderId;
                table.Rows.Add(row);
            }
        }

        public static DataTable From(IEnumerable<Specialization> specs)
        {
            var ss = specs ?? new List<Specialization>();
            return new SpecializationTable(ss).Value;
        }

        public static DataTable From(SpecializationGroup group)
        {
            return From(group.Specializations);
        }
    }
}
