// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data;
using Dapper;
using Services.Authorization;
using Model.Authorization;

namespace Services.Tables
{
    public class GroupMembership : ISqlTableType
    {
        public DataTable Value
        {
            get;
            private set;
        }
        public const string Type = @"auth.GroupMembership";
        const string group = @"Group";

        GroupMembership(params string[] groups)
        {
            var table = Schema();
            Fill(table, with: groups);
            Value = table;
        }

        DataTable Schema()
        {
            var dt = new DataTable();

            dt.Columns.Add(group, typeof(string));

            dt.SetTypeName(Type);

            return dt;
        }

        void Fill(DataTable table, params string[] with)
        {
            foreach (var gm in with)
            {
                var row = table.NewRow();
                row[group] = gm;
                table.Rows.Add(row);
            }
        }

        public static DataTable From(params string[] groups)
        {
            return new GroupMembership(groups).Value;
        }

        public static DataTable From(IUserContext user)
        {
            return new GroupMembership(user.Groups).Value;
        }
    }
}
