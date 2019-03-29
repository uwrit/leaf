// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;

namespace DTO.Compiler
{
    public class SchemaFieldSelectorDTO
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public bool Phi { get; set; }
        public bool Mask { get; set; }
        public bool Required { get; set; }

        public SchemaFieldSelectorDTO()
        {

        }

        public SchemaFieldSelectorDTO(SchemaFieldSelector fieldSelector)
        {
            Name = fieldSelector.Name;
            Type = fieldSelector.Type.ToString();
            Phi = fieldSelector.Phi;
            Mask = fieldSelector.Mask;
            Required = fieldSelector.Required;
        }
    }
}
