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
    using Exporter = Func<string, bool>;
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

        readonly int maxExportedCacheSize;

        public PatientCohortTable(Guid qid, PatientCohort cohort, int maxExportedCacheSize)
        {
            this.maxExportedCacheSize = maxExportedCacheSize;
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

            var saltCol = new DataColumn(salt, typeof(Guid))
            {
                AllowDBNull = true
            };
            dt.Columns.Add(saltCol);

            return dt;
        }

        void Fill(DataTable table, Guid qid, PatientCohort with)
        {
            var exporter = GetExporter(qid, with);

            FillWithDelegatedExport(table, qid, with, exporter);
        }

        // TODO(cspital) there is a way to optimize this larger than cohort case
        // NOTE(cspital) atm the performance gets worse as the size of the cohort approaches the maxSize due to rand misses
        Exporter GetExporter(Guid qid, PatientCohort cohort)
        {
            // small cohort, export them all
            var csize = cohort.PatientIds.Count;
            if (csize <= maxExportedCacheSize)
            {
                return (string patid) => true;
            }

            // need a subset
            var set = new HashSet<string>();
            var rnd = new Random(qid.GetHashCode());
            foreach (var _ in Enumerable.Range(0, maxExportedCacheSize))
            {
                string candidate;
                do
                {
                    candidate = cohort.PatientIds.ElementAt(rnd.Next(csize - 1));
                } while (!set.Add(candidate));
            }

            return (string patid) => set.Contains(patid);
        }

        void FillWithDelegatedExport(DataTable table, Guid qid, PatientCohort with, Exporter isExported)
        {
            foreach (var p in with.PatientIds)
            {
                var export = isExported(p);
                var row = table.NewRow();

                row[queryId] = qid;
                row[personId] = p;
                row[exported] = export;
                row[salt] = export ? (object)Guid.NewGuid() : DBNull.Value;

                table.Rows.Add(row);
            }
        }
    }
}
