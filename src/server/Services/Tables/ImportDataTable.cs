// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Data;
using System.Collections.Generic;
using Model.Import;

namespace Services.Tables
{
    public class ImportDataTable : ISqlTableType
    {
        public DataTable Value
        {
            get;
            private set;
        }
        public const string Type = @"app.ImportDataTable";
        const string id = "Id";
        const string importMetadataId = "ImportMetadataId";
        const string personId = "PersonId";
        const string sourcePersonId = "SourcePersonId";
        const string sourceValue = "SourceValue";
        const string sourceModifier = "SourceModifier";
        const string valueString = "ValueString";
        const string valueNumber = "ValueNumber";
        const string valueDate = "ValueDate";

        ImportDataTable(Guid mid, IEnumerable<ImportRecord> imports)
        {
            var table = Schema();
            Fill(table, mid, imports);
            Value = table;
        }

        DataTable Schema()
        {
            var dt = new DataTable();
            var cols = dt.Columns;

            cols.Add(new DataColumn(id, typeof(string)));
            cols.Add(new DataColumn(importMetadataId, typeof(Guid)));
            cols.Add(new DataColumn(personId, typeof(string)));
            cols.Add(new DataColumn(sourcePersonId, typeof(string)));
            cols.Add(new DataColumn(sourceValue, typeof(string)));
            cols.Add(new DataColumn(sourceModifier, typeof(string)));
            cols.Add(new DataColumn(valueString, typeof(string)));
            cols.Add(new DataColumn(valueNumber, typeof(double)));
            cols.Add(new DataColumn(valueDate, typeof(DateTime)));

            return dt;
        }

        void Fill(DataTable table, Guid mid, IEnumerable<ImportRecord> imports)
        {
            foreach (var i in imports)
            {
                var row = table.NewRow();
                var value = i.SourceValue.Length > 100 
                    ? i.SourceValue.Substring(0, 100)
                    : i.SourceValue;

                row[id] = i.Id;
                row[importMetadataId] = mid;
                row[personId] = i.PersonId;
                row[sourcePersonId] = i.SourcePersonId;
                row[sourceValue] = value;
                row[sourceModifier] = i.SourceModifier;

                if (i.ValueString != null)
                {
                    row[valueString] = value;
                }
                if (i.ValueNumber != null)
                {
                    row[valueNumber] = i.ValueNumber;
                }
                if (i.ValueDate != null)
                {
                    row[valueDate] = i.ValueDate;
                }
                table.Rows.Add(row);
            }
        }

        public static DataTable From(Guid mid, IEnumerable<Model.Import.ImportRecord> imports)
        {
            var impts = imports ?? new List<Model.Import.ImportRecord>();
            return new ImportDataTable(mid, impts).Value;
        }
    }
}