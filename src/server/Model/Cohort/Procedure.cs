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
    [Schema(Shape = Shape.Procedure)]
    public class Procedure : ShapedDataset
    {
        [Field(Name = ProcedureColumns.Category, Type = LeafType.String, Required = true)]
        public string Category { get; set; }

        [Field(Name = ProcedureColumns.Code, Type = LeafType.String, Required = true)]
        public string Code { get; set; }

        [Field(Name = ProcedureColumns.Coding, Type = LeafType.String, Required = true)]
        public string Coding { get; set; }

        [Field(Name = ProcedureColumns.EncounterId, Type = LeafType.String, Phi = true, Mask = true, Required = true)]
        public string EncounterId { get; set; }

        [Field(Name = ProcedureColumns.PerformedDateTime, Type = LeafType.DateTime, Phi = true, Mask = true, Required = true)]
        public DateTime? PerformedDateTime { get; set; }

        [Field(Name = ProcedureColumns.Text, Type = LeafType.String, Required = true)]
        public string Text { get; set; }
    }
}
