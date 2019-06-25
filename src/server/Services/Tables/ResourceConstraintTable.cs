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
    public class ResourceConstraintTable : ISqlTableType
    {
        public DataTable Value
        {
            get;
            private set;
        }

        public const string Type = "auth.ResourceConstraintTable";
        const string resourceId = "ResourceId";
        const string constraintId = "ConstraintId";
        const string constraintValue = "ConstraintValue";

        ResourceConstraintTable(Guid rid, IEnumerable<Model.Admin.Compiler.Constraint> cons)
        {
            var table = Schema();
            Fill(table, rid, cons);
            Value = table;
        }

        DataTable Schema()
        {
            var dt = new DataTable();
            var cols = dt.Columns;

            cols.Add(new DataColumn(resourceId, typeof(Guid)));
            cols.Add(new DataColumn(constraintId, typeof(int)));
            cols.Add(new DataColumn(constraintValue, typeof(string)));

            return dt;
        }

        void Fill(DataTable table, Guid rid, IEnumerable<Model.Admin.Compiler.Constraint> cons)
        {
            foreach (var c in cons)
            {
                var row = table.NewRow();
                row[resourceId] = rid;
                row[constraintId] = c.ConstraintId;
                row[constraintValue] = c.ConstraintValue;
                table.Rows.Add(row);
            }
        }

        public static DataTable From(Guid rid, IEnumerable<Model.Admin.Compiler.Constraint> cons)
        {
            var cs = cons ?? new List<Model.Admin.Compiler.Constraint>();
            return new ResourceConstraintTable(rid, cs).Value;
        }

        public static DataTable From(IConstrainedResource resource)
        {
            return From(resource.Id, resource.Constraints);
        }
    }
}
