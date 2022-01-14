// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;

namespace Model.Admin.Compiler
{
    public class AdminHelpPage
    {
        public AdminHelpPageTitle Title { get; set; }
        public AdminHelpPageCategory Category { get; set; }
        public IEnumerable<AdminHelpPageContent> Content { get; set; }
    }

    public class AdminHelpPageTitle
    {
        public Guid? Id { get; set; }
        public Guid? CategoryId { get; set; }
        public string Title { get; set; }
    }

    public class AdminHelpPageCategory
    {
        public Guid? Id { get; set; }
        public string Name { get; set; }
    }

    public class AdminHelpPageContent
    {
        public Guid? Id { get; set; }
        public Guid? PageId { get; set; }
        public int OrderId { get; set; }
        public string Type { get; set; }
        public string TextContent { get; set; }
        public string ImageId { get; set; }
        public byte[] ImageContent { get; set; }
        public int ImageSize { get; set; }
    }
}
