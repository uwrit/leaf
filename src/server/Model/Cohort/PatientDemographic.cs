// Copyright (c) 2019, UW Medicine Research IT
// Developed by Nic Dobbins and Cliff Spital
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using Model.Compiler;

namespace Model.Cohort
{
    [Schema(Shape = Shape.Demographic)]
    public class PatientDemographic : ShapedDataset
    {
        [Field(Name = DemographicColumns.AddressPostalCode, Type = LeafType.String, Required = true)]
        public string AddressPostalCode { get; set; }

        [Field(Name = DemographicColumns.AddressState, Type = LeafType.String, Required = true)]
        public string AddressState { get; set; }

        [Field(Name = DemographicColumns.Ethnicity, Type = LeafType.String, Required = true)]
        public string Ethnicity { get; set; }

        [Field(Name = DemographicColumns.Gender, Type = LeafType.String, Required = true)]
        public string Gender { get; set; }

        // NOTE(cspital) this gets calculated after sql runs, so there is no field for this
        public int? Age { get; set; }

        [Field(Name = DemographicColumns.Language, Type = LeafType.String, Required = true)]
        public string Language { get; set; }

        [Field(Name = DemographicColumns.MaritalStatus, Type = LeafType.String, Required = true)]
        public string MaritalStatus { get; set; }

        [Field(Name = DemographicColumns.Race, Type = LeafType.String, Required = true)]
        public string Race { get; set; }

        [Field(Name = DemographicColumns.Religion, Type = LeafType.String, Required = true)]
        public string Religion { get; set; }

        [Field(Name = DemographicColumns.IsMarried, Type = LeafType.Bool, Required = true)]
        public bool? IsMarried { get; set; }

        [Field(Name = DemographicColumns.IsHispanic, Type = LeafType.Bool, Required = true)]
        public bool? IsHispanic { get; set; }

        [Field(Name = DemographicColumns.IsDeceased, Type = LeafType.Bool, Required = true)]
        public bool? IsDeceased { get; set; }

        [Field(Name = DemographicColumns.BirthDate, Type = LeafType.DateTime, Phi = true, Mask = true)]
        public DateTime? BirthDate { get; set; }

        [Field(Name = DemographicColumns.DeathDate, Type = LeafType.DateTime, Phi = true, Mask = true)]
        public DateTime? DeathDate { get; set; }

        [Field(Name = DemographicColumns.Name, Type = LeafType.String, Phi = true, Mask = false)]
        public string Name { get; set; }

        [Field(Name = DemographicColumns.Mrn, Type = LeafType.String, Phi = true, Mask = false)]
        public string Mrn { get; set; }
    }
}
