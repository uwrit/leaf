// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Linq;
using System.Data;
using System.Collections.Generic;
using Model.Admin.Compiler;

namespace Services.Tables
{
    public class HelpContentTable : ISqlTableType
    {
        public DataTable Value
        {
            get;
            private set;
        }

        public const string Type = "adm.HelpContentTable";
        const string pageId = "PageId";
        const string category = "Category";
        const string title = "Title";
        const string orderId = "OrderId";
        const string type = "Type";
        const string textContent = "TextContent";
        const string imageContent = "ImageContent";
        const string imageId = "ImageId";

        HelpContentTable(IEnumerable<AdminHelpPageCreateUpdateSql> contentRows)
        {
            var table = Schema();
            Fill(table, contentRows);
            Value = table;
        }

        DataTable Schema()
        {
            var dt = new DataTable();
            var cols = dt.Columns;

            cols.Add(new DataColumn(pageId, typeof(int)));
            cols.Add(new DataColumn(category, typeof(string)));
            cols.Add(new DataColumn(title, typeof(string)));
            cols.Add(new DataColumn(orderId, typeof(int)));
            cols.Add(new DataColumn(type, typeof(string)));
            cols.Add(new DataColumn(textContent, typeof(string)));
            cols.Add(new DataColumn(imageContent, typeof(byte[])));
            cols.Add(new DataColumn(imageId, typeof(string)));

            return dt;
        }

        void Fill(DataTable table, IEnumerable<AdminHelpPageCreateUpdateSql> contentRows)
        {
            foreach (var r in contentRows)
            {
                var row = table.NewRow();
                row[pageId] = r.PageId;
                row[category] = r.Category;
                row[title] = r.Title;
                row[orderId] = r.OrderId;
                row[type] = r.Type;
                row[textContent] = r.TextContent;
                row[imageContent] = r.ImageContent;
                row[imageId] = r.ImageId;
                table.Rows.Add(row);
            }
        }

        public static DataTable From(IEnumerable<AdminHelpPageCreateUpdateSql> contentRows)
        {
            var cr = contentRows ?? new List<AdminHelpPageCreateUpdateSql>();
            return new HelpContentTable(cr).Value;
        }
    }
}
