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
    [Schema(Shape = Shape.Concept)]
    public class ConceptDataset : ShapedDataset
    {
        [Field(Name = ConceptColumns.EncounterId, Type = LeafType.String, Phi = true, Mask = true, Required = true)]
        public string EncounterId { get; set; }

        [Field(Name = ConceptColumns.DateField, Type = LeafType.DateTime, Phi = true, Mask = true, Required = true)]
        public DateTime? DateField { get; set; }

        [Field(Name = ConceptColumns.NumberField, Type = LeafType.Numeric)]
        public object NumberField { get; set; }
    }
}
