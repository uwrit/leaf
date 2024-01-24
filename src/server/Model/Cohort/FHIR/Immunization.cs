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
    [Schema(Shape = Shape.Immunization)]
    public class Immunization : ShapedDataset
    {
        [Field(Name = ImmunizationColumns.Coding, Type = LeafType.String, Required = true)]
        public string Coding { get; set; }

        [Field(Name = ImmunizationColumns.DoseQuantity, Type = LeafType.Numeric)]
        public object DoseQuantity { get; set; }

        [Field(Name = ImmunizationColumns.DoseUnit, Type = LeafType.String)]
        public string DoseUnit { get; set; }

        [Field(Name = ImmunizationColumns.EncounterId, Type = LeafType.String, Phi = true, Mask = true, Required = true)]
        public string EncounterId { get; set; }

        [Field(Name = ImmunizationColumns.OccurrenceDateTime, Type = LeafType.DateTime, Phi = true, Mask = true, Required = true)]
        public DateTime? OccurrenceDateTime { get; set; }

        [Field(Name = ImmunizationColumns.Route, Type = LeafType.String)]
        public string Route { get; set; }

        [Field(Name = ImmunizationColumns.Text, Type = LeafType.String, Required = true)]
        public string Text { get; set; }

        [Field(Name = ImmunizationColumns.VaccineCode, Type = LeafType.String, Required = true)]
        public string VaccineCode { get; set; }
    }
}
