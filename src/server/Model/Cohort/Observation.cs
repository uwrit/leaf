// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;

namespace Model.Cohort
{
    [Schema(Shape = Shape.Observation)]
    public class Observation : ShapedDataset
    {
        [Field(Name = ObservationColumns.Category, Type = LeafType.String, Required = true)]
        public string Category { get; set; }

        [Field(Name = ObservationColumns.Code, Type = LeafType.String, Required = true)]
        public string Code { get; set; }

        [Field(Name = ObservationColumns.EffectiveDate, Type = LeafType.DateTime, Required = true, Phi = true, Mask = true)]
        public DateTime? EffectiveDate { get; set; }

        [Field(Name = ObservationColumns.EncounterId, Type = LeafType.String, Required = true, Phi = true, Mask = true)]
        public string EncounterId { get; set; }

        [Field(Name = ObservationColumns.ReferenceRangeLow, Type = LeafType.Numeric)]
        public object ReferenceRangeLow { get; set; }

        [Field(Name = ObservationColumns.ReferenceRangeHigh, Type = LeafType.Numeric)]
        public object ReferenceRangeHigh { get; set; }

        [Field(Name = ObservationColumns.SpecimenType, Type = LeafType.String)]
        public string SpecimenType { get; set; }

        [Field(Name = ObservationColumns.ValueString, Type = LeafType.String, Required = true)]
        public string ValueString { get; set; }

        [Field(Name = ObservationColumns.ValueQuantity, Type = LeafType.Numeric)]
        public object ValueQuantity { get; set; }

        [Field(Name = ObservationColumns.ValueUnit, Type = LeafType.String)]
        public string ValueUnit { get; set; }
    }
}
