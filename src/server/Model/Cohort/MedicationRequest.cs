// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;
using Model.Schema;

namespace Model.Cohort
{
    [Schema(Shape = Shape.MedicationRequest)]
    public class MedicationRequest : ShapedDataset
    {
        [Field(Name = MedicationRequestColumns.Amount, Type = LeafType.String)]
        public object Amount { get; set; }

        [Field(Name = MedicationRequestColumns.AuthoredOn, Type = LeafType.String, Required = true)]
        public DateTime? AuthoredOn { get; set; }

        [Field(Name = MedicationRequestColumns.Category, Type = LeafType.String, Required = true)]
        public string Category { get; set; }

        [Field(Name = MedicationRequestColumns.Code, Type = LeafType.String, Required = true)]
        public string Code { get; set; }

        [Field(Name = MedicationRequestColumns.Coding, Type = LeafType.String, Required = true)]
        public string Coding { get; set; }

        [Field(Name = MedicationRequestColumns.EncounterId, Type = LeafType.String, Phi = true, Mask = true, Required = true)]
        public string EncounterId { get; set; }

        [Field(Name = MedicationRequestColumns.Form, Type = LeafType.String)]
        public string Form { get; set; }

        [Field(Name = MedicationRequestColumns.Text, Type = LeafType.String, Required = true)]
        public string Text { get; set; }

        [Field(Name = MedicationRequestColumns.Unit, Type = LeafType.String)]
        public string Unit { get; set; }
    }
}
