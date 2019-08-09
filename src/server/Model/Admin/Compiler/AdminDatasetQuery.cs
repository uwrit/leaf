// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Tagging;
using Model.Compiler;

namespace Model.Admin.Compiler
{
    public class AdminDatasetQuery : IConstrainedResource
    {
        // Standard fields
        public Guid Id { get; set; }
        public DatasetQueryUrn UniversalId { get; set; }
        public Shape Shape { get; set; }
        public string Name { get; set; }
        public int? CategoryId { get; set; }
        public string Description { get; set; }
        public string SqlStatement { get; set; }
        public IEnumerable<string> Tags { get; set; }
        public IEnumerable<Constraint> Constraints { get; set; }

        // Dynamic-only fields
        public bool IsEncounterBased { get; set; }
        public string SqlFieldDate { get; set; }
        public string SqlFieldValueString { get; set; }
        public string SqlFieldValueNumeric { get; set; }
        public DynamicDatasetQuerySchema Schema { get; set; }

        public DateTime Created { get; set; }
        public string CreatedBy { get; set; }
        public DateTime Updated { get; set; }
        public string UpdatedBy { get; set; }

        
    }
}
