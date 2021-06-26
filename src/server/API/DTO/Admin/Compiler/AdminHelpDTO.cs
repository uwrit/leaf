// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Admin.Compiler;

namespace API.DTO.Admin.Compiler
{
    public class AdminHelpCreateUpdateDTO
    {
        public int PageId { get; set; }
        public string Title { get; set; }
        public string Category { get; set; }
        public int OrderId { get; set; }
        public string Type { get; set; }
        public string TextContent { get; set; }
        //public byte[] ImageContent { get; set; }
        public string ImageContent { get; set; }
        public string ImageId { get; set; }

        public AdminHelpCreateUpdateDTO() { }

        public AdminHelpCreateUpdateDTO(AdminHelpPageCreateUpdateSql p)
        {
            PageId = p.PageId;
            Title = p.Title;
            Category = p.Category;
            OrderId = p.OrderId;
            Type = p.Type;
            TextContent = p.TextContent;
            ImageContent = p.ImageContent;
            ImageId = p.ImageId;
        }
    }

    public class AdminHelpContentDTO
    {
        public string Title { get; set; }
        public string Category { get; set; }

        public IEnumerable<HelpPageContent> Content { get; set; }

        public AdminHelpContentDTO() { }

        public AdminHelpContentDTO(AdminHelpPageContentSql p)
        {
            Title = p.Title;
            Category = p.Category;
            Content = p.Content;
        }
    }
}
