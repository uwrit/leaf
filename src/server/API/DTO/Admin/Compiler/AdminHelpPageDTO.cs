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
    public class AdminHelpPageDTO
    {
        public Guid? Id { get; set; }
        public string Title { get; set; }
        public AdminHelpPageCategory Category { get; set; }
        public IEnumerable<AdminHelpPageContent> Content { get; set; }

        public AdminHelpPageDTO() { }

        public AdminHelpPageDTO(AdminHelpPage page)
        {
            Id = page.Id;
            Title = page.Title;
            Category = page.Category;
            Content = page.Content;
        }
    }

    public static class AdminHelpPageExtensions
    {
        public static AdminHelpPage HelpPage(this AdminHelpPageDTO dto)
        {
            if (dto == null) return null;
            return new AdminHelpPage
            {
                Id = dto.Id,
                Title = dto.Title,
                Category = dto.Category,
                Content = dto.Content
            };
        }
    }

    public class PartialAdminHelpPageDTO
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public string Title { get; set; }

        public PartialAdminHelpPageDTO() { }

        public PartialAdminHelpPageDTO(PartialAdminHelpPage page)
        {
            Id = page.Id;
            CategoryId = page.CategoryId;
            Title = page.Title;
        }
    }

    public class AdminHelpPageCategoryDTO
    {
        public Guid? Id { get; set; }
        public string Name { get; set; }

        public AdminHelpPageCategoryDTO() { }

        public AdminHelpPageCategoryDTO(AdminHelpPageCategory cat)
        {
            Id = cat.Id;
            Name = cat.Name;
        }
    }

    public class AdminHelpPageContentDTO
    {
        public Guid? Id { get; set; }
        public int OrderId { get; set; }
        public string Type { get; set; }
        public string TextContent { get; set; }
        public string ImageId { get; set; }
        public byte[] ImageContent { get; set; }
        public int ImageSize { get; set; }

        public AdminHelpPageContentDTO() { }

        public AdminHelpPageContentDTO(AdminHelpPageContent con)
        {
            Id = con.Id;
            OrderId = con.OrderId;
            Type = con.Type;
            TextContent = con.TextContent;
            ImageId = con.ImageId;
            ImageContent = con.ImageContent;
            ImageSize = con.ImageSize;
        }
    }
}