// Copyright (c) 2020, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using Model.Schema;

namespace Model.Cohort
{
    [Schema(Shape = Shape.MedicationAdministration)]
    public class MedicationAdministration : ShapedDataset
    {
        [Field(Name = MedicationAdministrationColumns.Code, Type = LeafType.String, Required = true)]
        public string Code { get; set; }

        [Field(Name = MedicationAdministrationColumns.Coding, Type = LeafType.String, Required = true)]
        public string Coding { get; set; }

        [Field(Name = MedicationAdministrationColumns.DoseQuantity, Type = LeafType.String)]
        public object DoseQuantity { get; set; }

        [Field(Name = MedicationAdministrationColumns.DoseUnit, Type = LeafType.String)]
        public string DoseUnit { get; set; }

        [Field(Name = MedicationAdministrationColumns.EncounterId, Type = LeafType.String, Phi = true, Mask = true, Required = true)]
        public string EncounterId { get; set; }

        [Field(Name = MedicationAdministrationColumns.EffectiveDateTime, Type = LeafType.DateTime, Phi = true, Mask = true, Required = true)]
        public DateTime? EffectiveDateTime { get; set; }

        [Field(Name = MedicationAdministrationColumns.Route, Type = LeafType.String)]
        public string Route { get; set; }

        [Field(Name = MedicationAdministrationColumns.Text, Type = LeafType.String, Required = true)]
        public string Text { get; set; }
    }
}
