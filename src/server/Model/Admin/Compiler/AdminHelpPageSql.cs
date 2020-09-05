// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Admin.Compiler
{
    public class AdminHelpPageSQL
    {
        public int Id { get; set; }
        public int CategoryId { get; set; }
        public string Title { get; set; }
    }

    public class AdminHelpPageContentSql
    {
        public int Id { get; set; }
        public int PageId { get; set; }
        public int OrderId { get; set; }
        public string Type { get; set; }
        public string TextContent { get; set; }
        public byte[] ImageContent { get; set; }
        public string ImageId { get; set; }
    }
}
