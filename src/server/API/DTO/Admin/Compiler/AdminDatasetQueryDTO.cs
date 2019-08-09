// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using System.Linq;
using Model.Compiler;
using Model.Admin.Compiler;
using Model.Tagging;

namespace API.DTO.Admin.Compiler
{
    public class AdminDatasetQueryDTO
    {
        public Guid Id { get; set; }
        public string UniversalId { get; set; }
        public bool IsEncounterBased { get; set; }
        public Shape Shape { get; set; }
        public string Name { get; set; }
        public int? CategoryId { get; set; }
        public string Description { get; set; }
        public string SqlStatement { get; set; }
        public string SqlFieldDate { get; set; }
        public string SqlFieldValueString { get; set; }
        public string SqlFieldValueNumeric { get; set; }
        public DynamicDatasetQuerySchema Schema { get; set; }
        public DateTime Created { get; set; }
        public string CreatedBy { get; set; }
        public DateTime Updated { get; set; }
        public string UpdatedBy { get; set; }

        public IEnumerable<string> Tags { get; set; }

        public IEnumerable<Constraint> Constraints { get; set; }
    }

    public static class AdminDatasetQueryExt
    {
        public static AdminDatasetQueryDTO AdminDatasetQueryDTO(this AdminDatasetQuery q)
        {
            if (q == null) return null;
            return new AdminDatasetQueryDTO
            {
                Id = q.Id,
                UniversalId = q.UniversalId?.ToString(),
                Shape = q.Shape,
                Name = q.Name,
                CategoryId = q.CategoryId,
                Description = q.Description,
                SqlStatement = q.SqlStatement,
                IsEncounterBased = q.IsEncounterBased,
                SqlFieldDate = q.SqlFieldDate,
                SqlFieldValueString = q.SqlFieldValueString,
                SqlFieldValueNumeric = q.SqlFieldValueNumeric,
                Schema = q.Schema,
                Created = q.Created,
                CreatedBy = q.CreatedBy,
                Updated = q.Updated,
                UpdatedBy = q.UpdatedBy,
                Tags = q.Tags,
                Constraints = q.Constraints
            };
        }

        public static AdminDatasetQuery AdminDatasetQuery(this AdminDatasetQueryDTO q)
        {
            if (q == null) return null;
            return new AdminDatasetQuery
            {
                Id = q.Id,
                UniversalId = DatasetQueryUrn.From(q.UniversalId),
                Shape = q.Shape,
                Name = q.Name,
                CategoryId = q.CategoryId,
                Description = q.Description,
                SqlStatement = q.SqlStatement,
                IsEncounterBased = q.IsEncounterBased,
                SqlFieldDate = q.SqlFieldDate,
                SqlFieldValueString = q.SqlFieldValueString,
                SqlFieldValueNumeric = q.SqlFieldValueNumeric,
                Schema = q.Schema,
                Created = q.Created,
                CreatedBy = q.CreatedBy,
                Updated = q.Updated,
                UpdatedBy = q.UpdatedBy,
                Tags = q.Tags,
                Constraints = q.Constraints
            };
        }
    }
}
