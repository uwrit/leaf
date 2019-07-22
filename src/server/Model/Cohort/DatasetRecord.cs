// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Reflection;
using System.Linq;
using System.Collections.Generic;
using Model.Anonymization;
using Model.Compiler;
using Model.Schema;

namespace Model.Cohort
{
    public class DynamicDatasetRecord : ShapedDataset, ISalt
    {
        readonly Dictionary<string, object> keyValues = new Dictionary<string, object>();

        [Field(Name = DatasetColumns.Salt, Type = LeafType.Guid, Required = true)]
        public Guid Salt { get; set; }

        public DynamicDatasetRecord()
        {

        }

        public IEnumerable<string> Keys => keyValues.Keys;

        public IEnumerable<KeyValuePair<string, object>> KeyValues => keyValues.ToArray();

        public KeyValuePair<string, object> GetKeyValuePair(string key)
        {
            return new KeyValuePair<string, object>(key, GetValue(key));
        }

        public object GetValue(string key)
        {
            if (keyValues.TryGetValue(key, out object value))
            {
                return value;
            }
            return null;
        }

        public void SetValue(string key, object value)
        {
            keyValues[key] = value;
        }

        public DynamicShapedDatumSet ToDatumSet()
        {
            return new DynamicShapedDatumSet(keyValues);
        }
    }

    public class MedicationAdministrationDatasetRecord : MedicationAdministration, ISalt
    {
        [Field(Name = DatasetColumns.Salt, Type = LeafType.Guid, Required = true)]
        public Guid Salt { get; set; }

        public MedicationAdministration ToMedicationAdministration()
        {
            return new MedicationAdministration
            {
                PersonId = PersonId,
                Code = Code,
                Coding = Coding,
                DoseQuantity = DoseQuantity,
                DoseUnit = DoseUnit,
                EffectiveDateTime = EffectiveDateTime,
                EncounterId = EncounterId,
                Route = Route,
                Text = Text
            };
        }
    }

    public class MedicationRequestDatasetRecord : MedicationRequest, ISalt
    {
        [Field(Name = DatasetColumns.Salt, Type = LeafType.Guid, Required = true)]
        public Guid Salt { get; set; }

        public MedicationRequest ToMedicationRequest()
        {
            return new MedicationRequest
            {
                PersonId = PersonId,
                Amount = Amount,
                AuthoredOn = AuthoredOn,
                Category = Category,
                Code = Code,
                Coding = Coding,
                EncounterId = EncounterId,
                Form = Form,
                Text = Text,
                Unit = Unit
            };
        }
    }

    public class AllergyDatasetRecord : Allergy, ISalt
    {
        [Field(Name = DatasetColumns.Salt, Type = LeafType.Guid, Required = true)]
        public Guid Salt { get; set; }

        public Allergy ToAllergy()
        {
            return new Allergy
            {
                PersonId = PersonId,
                Category = Category,
                Code = Code,
                Coding = Coding,
                EncounterId = EncounterId,
                OnsetDateTime = OnsetDateTime,
                RecordedDate = RecordedDate,
                Text = Text
            };
        }
    }

    public class ImmunizationDatasetRecord : Immunization, ISalt
    {
        [Field(Name = DatasetColumns.Salt, Type = LeafType.Guid, Required = true)]
        public Guid Salt { get; set; }

        public Immunization ToImmunization()
        {
            return new Immunization
            {
                PersonId = PersonId,
                DoseQuantity = DoseQuantity,
                DoseUnit = DoseUnit,
                Coding = Coding,
                EncounterId = EncounterId,
                OccurrenceDateTime = OccurrenceDateTime,
                Route = Route,
                Text = Text,
                VaccineCode = VaccineCode
            };
        }
    }

    public class ProcedureDatasetRecord : Procedure, ISalt
    {
        [Field(Name = DatasetColumns.Salt, Type = LeafType.Guid, Required = true)]
        public Guid Salt { get; set; }

        public Procedure ToProcedure()
        {
            return new Procedure
            {
                PersonId = PersonId,
                Category = Category,
                Code = Code,
                Coding = Coding,
                EncounterId = EncounterId,
                PerformedDateTime = PerformedDateTime,
                Text = Text
            };
        }
    }

    public class ConditionDatasetRecord : Condition, ISalt
    {
        [Field(Name = DatasetColumns.Salt, Type = LeafType.Guid, Required = true)]
        public Guid Salt { get; set; }

        public Condition ToCondition()
        {
            return new Condition
            {
                PersonId = PersonId,
                AbatementDateTime = AbatementDateTime,
                Category = Category,
                Code = Code,
                Coding = Coding,
                EncounterId = EncounterId,
                OnsetDateTime = OnsetDateTime,
                RecordedDate = RecordedDate,
                Text = Text
            };
        }
    }

    public class ObservationDatasetRecord : Observation, ISalt
    {
        [Field(Name = DatasetColumns.Salt, Type = LeafType.Guid, Required = true)]
        public Guid Salt { get; set; }

        public Observation ToObservation()
        {
            return new Observation
            {
                PersonId = PersonId,
                Category = Category,
                Code = Code,
                EffectiveDate = EffectiveDate,
                EncounterId = EncounterId,
                ReferenceRangeLow = ReferenceRangeLow,
                ReferenceRangeHigh = ReferenceRangeHigh,
                SpecimenType = SpecimenType,
                ValueString = ValueString,
                ValueQuantity = ValueQuantity,
                ValueUnit = ValueUnit
            };
        }
    }

    public class EncounterDatasetRecord : Encounter, ISalt
    {
        [Field(Name = DatasetColumns.Salt, Type = LeafType.Guid, Required = true)]
        public Guid Salt { get; set; }

        public Encounter ToEncounter()
        {
            return new Encounter
            {
                PersonId = PersonId,
                AdmitDate = AdmitDate,
                AdmitSource = AdmitSource,
                Class = Class,
                DischargeDate = DischargeDate,
                DischargeDisposition = DischargeDisposition,
                EncounterId = EncounterId,
                Location = Location,
                Status = Status
            };
        }
    }

    public class PatientDemographicRecord : PatientDemographic, ISalt
    {
        [Field(Name = DemographicColumns.Exported, Type = LeafType.Bool, Required = true)]
        public bool Exported { get; set; }

        [Field(Name = DatasetColumns.Salt, Type = LeafType.Guid, Required = true)]
        public Guid? MaybeSalt { get; set; }
        public Guid Salt => MaybeSalt.Value;

        public PatientDemographic ToIdentifiedPatientDemographic()
        {
            return new PatientDemographic
            {
                PersonId = PersonId,
                AddressPostalCode = AddressPostalCode,
                AddressState = AddressState,
                Ethnicity = Ethnicity,
                Gender = Gender,
                Age = Age,
                Language = Language,
                MaritalStatus = MaritalStatus,
                Race = Race,
                Religion = Religion,
                IsMarried = IsMarried,
                IsHispanic = IsHispanic,
                IsDeceased = IsDeceased,
                BirthDate = BirthDate,
                DeathDate = DeathDate,
                Name = Name,
                Mrn = Mrn
            };
        }

        public PatientDemographic ToAnonymousPatientDemographic()
        {
            return new PatientDemographic
            {
                PersonId = PersonId,
                AddressPostalCode = AddressPostalCode,
                AddressState = AddressState,
                Ethnicity = Ethnicity,
                Gender = Gender,
                Age = Age,
                Language = Language,
                MaritalStatus = MaritalStatus,
                Race = Race,
                Religion = Religion,
                IsMarried = IsMarried,
                IsHispanic = IsHispanic,
                IsDeceased = IsDeceased
            };
        }
    }
}
