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

    abstract class BaseDatasetQueryRecord
    {
        public Guid? Id { get; set; }
        public string UniversalId { get; set; }
        public Shape Shape { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public string Description { get; set; }
        public string SqlStatement { get; set; }
    }

    class DatasetQueryRecord : BaseDatasetQueryRecord
    {
        public virtual IDatasetQuery DatasetQuery()
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

    class DynamicDatasetQueryRecord : DatasetQueryRecord
    {
        public bool IsEncounterBased { get; set; }
        public string SqlFieldDate { get; set; }
        public string SqlFieldValueString { get; set; }
        public string SqlFieldValueNumeric { get; set; }
        public string Schema { get; set; }

        public DynamicDatasetQueryRecord()
        {

        }

        public DynamicDatasetQueryRecord(DynamicDatasetQuery dq)
        {
            Id = dq.Id;
            Shape = dq.Shape;
            Name = dq.Name;
            Category = dq.Category;
            Description = dq.Description;
            SqlStatement = dq.SqlStatement;
            SqlFieldDate = dq.SqlFieldDate;
            SqlFieldValueString = dq.SqlFieldValueString;
            SqlFieldValueNumeric = dq.SqlFieldValueNumeric;
            IsEncounterBased = dq.IsEncounterBased;
            Schema = DynamicDatasetSchemaFieldSerde.Serialize(dq.Schema);
        }

        public override IDatasetQuery DatasetQuery()
        {
            return new DynamicDatasetQuery
            {
                Id = Id,
                Shape = Shape,
                Name = Name,
                Category = Category,
                Description = Description,
                SqlStatement = SqlStatement,
                SqlFieldDate = SqlFieldDate,
                SqlFieldValueString = SqlFieldValueString,
                SqlFieldValueNumeric = SqlFieldValueNumeric,
                IsEncounterBased = IsEncounterBased,
                Schema = DynamicDatasetSchemaFieldSerde.Deserialize(Schema)
            };
        }
    }

    class DatasetQueryTag
    {
        public Guid? Id { get; set; }
        public string Tag { get; set; }
    }
}
