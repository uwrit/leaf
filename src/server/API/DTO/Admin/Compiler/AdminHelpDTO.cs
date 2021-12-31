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
        // TODO: update title type once sql reader figured out
        public string Title { get; set; }
        public AdminHelpPageCategory Category { get; set; }
        public IEnumerable<AdminHelpPageContent> Content { get; set; }

        public AdminHelpPageDTO() { }

        public AdminHelpPageDTO(AdminHelpPage p)
        {
            Title = p.Title;
            Category = p.Category;
            Content = p.Content;
        }
    }

    public static class AdminHelpPageExtensions
    {
        public static AdminHelpPage HelpPage(this AdminHelpPageDTO dto)
        {
            if (dto == null) return null;
            return new AdminHelpPage
            {
                Title = dto.Title,
                Category = dto.Category,
                Content = dto.Content
            };
        }
    }
}