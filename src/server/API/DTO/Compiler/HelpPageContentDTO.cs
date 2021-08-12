// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.ObjectModel;
using Model.Compiler;
namespace API.DTO.Compiler
{
    public class HelpPageContentDTO
    {
        public Guid Id { get; set; }
        public Guid PageId { get; set; }
        public int OrderId { get; set; }
        public string Type { get; set; }
        public string TextContent { get; set; }
        public byte[] ImageContent { get; set; }
        public string ImageId { get; set; }

        public HelpPageContentDTO() { }

        public HelpPageContentDTO(HelpPageContentSql content)
        {
            Id = content.Id;
            PageId = content.PageId;
            OrderId = content.OrderId;
            Type = content.Type;
            TextContent = content.TextContent;
            ImageContent = content.ImageContent;
            ImageId = content.ImageId;
        }
    }
}