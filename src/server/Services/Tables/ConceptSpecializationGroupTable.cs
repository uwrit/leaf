// Copyright (c) 2020, UW Medicine Research IT, University of Washington
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
    public class ConceptSpecializationGroupTable : ISqlTableType
    {
        public DataTable Value
        {
            get;
            private set;
        }

        public const string Type = "rela.ConceptSpecializationGroupTable";
        const string conceptId = "ConceptId";
        const string specializationGroupId = "SpecializationGroupId";
        const string orderId = "OrderId";

        ConceptSpecializationGroupTable(Guid conceptId, IEnumerable<SpecializationGroupRelationship> relas)
        {
            var table = Schema();
            Fill(table, conceptId, relas);
            Value = table;
        }

        DataTable Schema()
        {
            var dt = new DataTable();
            var cols = dt.Columns;

            cols.Add(new DataColumn(conceptId, typeof(Guid)));
            cols.Add(new DataColumn(specializationGroupId, typeof(int)));
            cols.Add(new DataColumn(orderId, typeof(int))
            {
                AllowDBNull = true
            });

            return dt;
        }

        void Fill(DataTable table, Guid cid, IEnumerable<SpecializationGroupRelationship> relas)
        {
            foreach (var r in relas)
            {
                var row = table.NewRow();
                row[conceptId] = cid;
                row[specializationGroupId] = r.SpecializationGroupId;
                row[orderId] = ValueElseDBNull(r.OrderId);
                table.Rows.Add(row);
            }
        }

        object ValueElseDBNull(object val)
        {
            if (val == null)
            {
                return DBNull.Value;
            }
            return val;
        }

        public static DataTable From(Guid conceptId, IEnumerable<SpecializationGroupRelationship> relas)
        {
            var rs = relas ?? new List<SpecializationGroupRelationship>();
            return new ConceptSpecializationGroupTable(conceptId, rs).Value;
        }

        public static DataTable From(AdminConcept concept)
        {
            return From(concept.Id, concept.SpecializationGroups);
        }
    }
}
