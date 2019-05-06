// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Cohort;
using Model.Compiler;
using Model.Tagging;

namespace Services.Search
{
    class DatasetQueryRecord
    {
        public Guid? Id { get; set; }
        public string UniversalId { get; set; }
        public Shape Shape { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public string SqlStatement { get; set; }

        public DatasetQueryRecord()
        {

        }

        public DatasetQueryRecord(DatasetQuery dq)
        {
            Id = dq.Id;
            UniversalId = dq.UniversalId?.ToString();
            Shape = dq.Shape;
            Name = dq.Name;
            Category = dq.Category;
            Description = dq.Description;
            SqlStatement = dq.SqlStatement;
        }

        public DatasetQuery DatasetQuery()
        {
            return new DatasetQuery
            {
                Id = Id,
                UniversalId = DatasetQueryUrn.From(UniversalId),
                Shape = Shape,
                Name = Name,
                Category = Category,
                Description = Description,
                SqlStatement = SqlStatement
            };
        }
    }

    class DatasetQueryTag
    {
        public Guid? Id { get; set; }
        public string Tag { get; set; }
    }
}
