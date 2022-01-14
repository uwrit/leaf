// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Compiler;

namespace API.DTO.Compiler
{
    public class HelpPageDTO
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public string Title { get; set; }

        public HelpPageDTO() { }

        public HelpPageDTO(HelpPage page)
        {
            Id = page.Id;
            CategoryId = page.CategoryId;
            Title = page.Title;
        }
    }

    public class HelpPageCategoryDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }

        public HelpPageCategoryDTO() { }

        public HelpPageCategoryDTO(HelpPageCategory cat)
        {
            Id = cat.Id;
            Name = cat.Name;
        }
    }

    public class HelpPageContentDTO
    {
        public Guid Id { get; set; }
        public Guid PageId { get; set; }
        public int OrderId { get; set; }
        public string Type { get; set; }
        public string TextContent { get; set; }
        public string ImageId { get; set; }
        public byte[] ImageContent { get; set; }
        public int ImageSize { get; set; }

        public HelpPageContentDTO() { }

        public HelpPageContentDTO(HelpPageContent con)
        {
            Id = con.Id;
            PageId = con.PageId;
            OrderId = con.OrderId;
            Type = con.Type;
            TextContent = con.TextContent;
            ImageId = con.ImageId;
            ImageContent = con.ImageContent;
            ImageSize = con.ImageSize;
        }
    }
}