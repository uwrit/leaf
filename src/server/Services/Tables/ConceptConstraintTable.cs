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
    public class ConceptConstraintTable : ISqlTableType
    {
        public DataTable Value
        {
            get;
            private set;
        }

        public const string Type = "auth.ConceptConstraintTable";
        const string conceptId = "ConceptId";
        const string constraintId = "ConstraintId";
        const string constraintValue = "ConstraintValue";

        ConceptConstraintTable(Guid conceptId, IEnumerable<ConceptConstraint> cons)
        {
            var table = Schema();
            Fill(table, conceptId, cons);
            Value = table;
        }

        DataTable Schema()
        {
            var dt = new DataTable();
            var cols = dt.Columns;

            cols.Add(new DataColumn(conceptId, typeof(Guid)));
            cols.Add(new DataColumn(constraintId, typeof(int)));
            cols.Add(new DataColumn(constraintValue, typeof(string)));

            return dt;
        }

        void Fill(DataTable table, Guid cid, IEnumerable<ConceptConstraint> cons)
        {
            foreach (var c in cons)
            {
                var row = table.NewRow();
                row[conceptId] = cid;
                row[constraintId] = c.ConstraintId;
                row[constraintValue] = c.ConstraintValue;
                table.Rows.Add(row);
            }
        }

        public static DataTable From(Guid conceptId, IEnumerable<ConceptConstraint> cons)
        {
            var cs = cons ?? new List<ConceptConstraint>();
            return new ConceptConstraintTable(conceptId, cs).Value;
        }

        public static DataTable From(AdminConcept concept)
        {
            return From(concept.Id, concept.Constraints);
        }
    }
}
