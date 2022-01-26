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
    public class HelpPageTable : ISqlTableType
    {
        public DataTable Value
        {
            get;
            private set;
        }

        public const string Type  = "adm.HelpContentTable";
        const string title        = "Title";
        const string category     = "Category";
        const string pageId       = "PageId";
        const string orderId      = "OrderId";
        const string type         = "Type";
        const string textContent  = "TextContent";
        const string imageId      = "ImageId";
        const string imageContent = "ImageContent";
        const string imageSize    = "ImageSize";

        HelpPageTable(AdminHelpPage page)
        {
            var table = Schema();
            Fill(table, page);
            Value = table;
        }

        DataTable Schema()
        {
            var dt = new DataTable();
            var cols = dt.Columns;

            cols.Add(new DataColumn(title, typeof(string)));
            cols.Add(new DataColumn(category, typeof(string)));
            cols.Add(new DataColumn(pageId, typeof(Guid)));
            cols.Add(new DataColumn(orderId, typeof(int)));
            cols.Add(new DataColumn(type, typeof(string)));
            cols.Add(new DataColumn(textContent, typeof(string)));
            cols.Add(new DataColumn(imageId, typeof(string)));
            cols.Add(new DataColumn(imageContent, typeof(byte[])));
            cols.Add(new DataColumn(imageSize, typeof(int)));

            return dt;
        }

        void Fill(DataTable table, AdminHelpPage page)
        {
            foreach (var r in page.Content)
            {
                var row = table.NewRow();
                row[title]        = page.Title;
                row[category]     = page.Category.Name;
                row[orderId]      = r.OrderId;
                row[type]         = r.Type;
                row[textContent]  = r.TextContent;
                row[imageId]      = r.ImageId;
                row[imageContent] = r.ImageContent;
                row[imageSize]    = r.ImageSize;

                if (page.Id != null)
                {
                    row[pageId] = page.Id;
                };

                table.Rows.Add(row);
            }
        }

        public static DataTable From(AdminHelpPage p)
        {
            var page = p ?? new AdminHelpPage();
            return new HelpPageTable(page).Value;
        }
    }
}