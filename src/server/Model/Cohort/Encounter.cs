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
    [Schema(Shape = Shape.Encounter)]
    public class Encounter : ShapedDataset
    {
        [Field(Name = EncounterColumns.AdmitDate, Type = LeafType.DateTime, Required = true, Phi = true, Mask = true)]
        public DateTime? AdmitDate { get; set; }

        [Field(Name = EncounterColumns.AdmitSource, Type = LeafType.String)]
        public string AdmitSource { get; set; }

        [Field(Name = EncounterColumns.Class, Type = LeafType.String, Required = true)]
        public string Class { get; set; }

        [Field(Name = EncounterColumns.DischargeDate, Type = LeafType.DateTime, Required = true, Phi = true, Mask = true)]
        public DateTime? DischargeDate { get; set; }

        [Field(Name = EncounterColumns.DischargeDisposition, Type = LeafType.String)]
        public string DischargeDisposition { get; set; }

        [Field(Name = EncounterColumns.EncounterId, Type = LeafType.String, Required = true, Phi = true, Mask = true)]
        public string EncounterId { get; set; }

        [Field(Name = EncounterColumns.Location, Type = LeafType.String, Required = true)]
        public string Location { get; set; }

        [Field(Name = EncounterColumns.Status, Type = LeafType.String)]
        public string Status { get; set; }
    }
}
