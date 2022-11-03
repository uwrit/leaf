// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using Model.Schema;

namespace Model.Cohort
{
    [Schema(Shape = Shape.Condition)]
    public class Condition : ShapedDataset
    {
        [Field(Name = ConditionColumns.AbatementDateTime, Type = LeafType.DateTime, Phi = true, Mask = true)]
        public DateTime? AbatementDateTime { get; set; }

        [Field(Name = ConditionColumns.Category, Type = LeafType.String, Required = true)]
        public string Category { get; set; }

        [Field(Name = ConditionColumns.Code, Type = LeafType.String, Required = true)]
        public string Code { get; set; }

        [Field(Name = ConditionColumns.Coding, Type = LeafType.String, Required = true)]
        public string Coding { get; set; }

        [Field(Name = ConditionColumns.EncounterId, Type = LeafType.String, Phi = true, Mask = true, Required = true)]
        public string EncounterId { get; set; }

        [Field(Name = ConditionColumns.OnsetDateTime, Type = LeafType.DateTime, Phi = true, Mask = true, Required = true)]
        public DateTime? OnsetDateTime { get; set; }

        [Field(Name = ConditionColumns.RecordedDate, Type = LeafType.DateTime, Phi = true, Mask = true)]
        public DateTime? RecordedDate { get; set; }

        [Field(Name = ConditionColumns.Text, Type = LeafType.String, Required = true)]
        public string Text { get; set; }
    }
}
