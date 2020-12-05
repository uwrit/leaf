// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
namespace API.DTO.Compiler
{
    public class HelpPageCategoryDTO
    {
        public int Id { get; set; }
        public string Category { get; set; }

        public HelpPageCategoryDTO() { }

        public HelpPageCategoryDTO(HelpPageCategorySql c)
        {
            Id = c.Id;
            Category = c.Category;
        }
    }
}
