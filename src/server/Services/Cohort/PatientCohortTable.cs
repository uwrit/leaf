// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data;
using System.Linq;
using Model.Cohort;
using System.Collections.Generic;
using Services.Extensions;

namespace Services.Cohort
{
    class PatientCohortTable
    {
        public DataTable Value
        {
            get;
            private set;
        }
        public DataRow[] Rows => Value.Rows.Cast<DataRow>().ToArray();

        public const string Table = "app.Cohort";
        const string queryId = "QueryId";
        const string personId = "PersonId";
        const string exported = "Exported";
        const string salt = "Salt";

        public PatientCohortTable(Guid qid, IEnumerable<SeasonedPatient> cohort)
        {
            var table = Schema();
            Fill(table, qid, with: cohort);
            Value = table;
        }

        DataTable Schema()
        {
            var dt = new DataTable();

            dt.Columns.Add(queryId, typeof(Guid));
            dt.Columns.Add(personId, typeof(string));
            dt.Columns.Add(exported, typeof(bool));

            dt.Columns.Add(new DataColumn(salt, typeof(Guid))
            {
                AllowDBNull = true
            });

            return dt;
        }

        void Fill(DataTable table, Guid qid, IEnumerable<SeasonedPatient> with)
        {
            foreach (var p in with)
            {
                var row = table.NewRow();

                row[queryId] = qid;
                row[personId] = p.Id;
                row[exported] = p.Exported;
                row[salt] = p.Salt.HasValue ? (object)p.Salt.Value : DBNull.Value;

                table.Rows.Add(row);
            }
        }
    }
}
