// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Compiler;

namespace API.DTO.Compiler
{
    public class DatasetQueryDTO
    {
        public string Id { get; set; }
        public string UniversalId { get; set; }
        public bool IsEncounterBased { get; set; }
        public Shape Shape { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public ICollection<string> Tags { get; set; }

        public DatasetQueryDTO(IDatasetQuery dq)
        {
            Id = dq.Id.Value.ToString();
            UniversalId = dq.UniversalId?.ToString();
            IsEncounterBased = dq.IsEncounterBased;
            Shape = dq.Shape;
            Name = dq.Name;
            Category = dq.Category;
            Description = dq.Description;
            Tags = dq.Tags;
        }
    }
}
