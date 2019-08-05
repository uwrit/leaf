// Copyright (c) 2019, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;
using System.Collections.Generic;
using Model.Compiler;

namespace Model.Cohort
{
    public abstract class MarshalPlan
    {
        public SchemaField Salt { get; set; }
        public SchemaField PersonId { get; set; }

        protected MarshalPlan() { }
        protected MarshalPlan(DatasetResultSchema schema)
        {
            if (schema.TryGet(DatasetColumns.PersonId, out var field))
            {
                PersonId = field;
            }

            if (schema.TryGet(DatasetColumns.Salt, out var salt))
            {
                Salt = salt;
            }
        }
    }

    public sealed class DynamicMarshalPlan : MarshalPlan
    {
        public Dictionary<string, object> KeyValues = new Dictionary<string, object>();

        public IEnumerable<string> Columns => KeyValues.Keys;

        public DynamicMarshalPlan()
        {

        }

        public DynamicMarshalPlan(DatasetResultSchema schema) : base(schema)
        {
            foreach (var field in schema.Fields)
            {
                KeyValues.Add(field.Name, schema.Get(field));
            }
        }
    }

    public sealed class MedicationAdministrationMarshalPlan : MarshalPlan
    {
        public SchemaField Code { get; set; }
        public SchemaField Coding { get; set; }
        public SchemaField DoseQuantity { get; set; }
        public SchemaField DoseUnit { get; set; }
        public SchemaField EffectiveDateTime { get; set; }
        public SchemaField EncounterId { get; set; }
        public SchemaField Route { get; set; }
        public SchemaField Text { get; set; }

        public MedicationAdministrationMarshalPlan()
        {

        }

        public MedicationAdministrationMarshalPlan(DatasetResultSchema schema) : base(schema)
        {
            if (schema.TryGet(MedicationAdministrationColumns.Code, out var code))
            {
                Code = code;
            }

            if (schema.TryGet(MedicationAdministrationColumns.Coding, out var coding))
            {
                Coding = coding;
            }

            if (schema.TryGet(MedicationAdministrationColumns.DoseQuantity, out var doseQuantity))
            {
                DoseQuantity = doseQuantity;
            }

            if (schema.TryGet(MedicationAdministrationColumns.DoseUnit, out var doseUnit))
            {
                DoseUnit = doseUnit;
            }

            if (schema.TryGet(MedicationAdministrationColumns.EffectiveDateTime, out var effectiveDateTime))
            {
                EffectiveDateTime = effectiveDateTime;
            }

            if (schema.TryGet(MedicationAdministrationColumns.EncounterId, out var encounterId))
            {
                EncounterId = encounterId;
            }

            if (schema.TryGet(MedicationAdministrationColumns.Route, out var route))
            {
                Route = route;
            }

            if (schema.TryGet(MedicationAdministrationColumns.Text, out var text))
            {
                Text = text;
            }
        }
    }

    public sealed class MedicationRequestMarshalPlan : MarshalPlan
    {
        public SchemaField Amount { get; set; }
        public SchemaField AuthoredOn { get; set; }
        public SchemaField Category { get; set; }
        public SchemaField Code { get; set; }
        public SchemaField Coding { get; set; }
        public SchemaField EncounterId { get; set; }
        public SchemaField Form { get; set; }
        public SchemaField Text { get; set; }
        public SchemaField Unit { get; set; }

        public MedicationRequestMarshalPlan()
        {

        }

        public MedicationRequestMarshalPlan(DatasetResultSchema schema) : base(schema)
        {
            if (schema.TryGet(MedicationRequestColumns.Amount, out var amount))
            {
                Amount = amount;
            }

            if (schema.TryGet(MedicationRequestColumns.AuthoredOn, out var authoredOn))
            {
                AuthoredOn = authoredOn;
            }

            if (schema.TryGet(MedicationRequestColumns.Category, out var category))
            {
                Category = category;
            }

            if (schema.TryGet(MedicationRequestColumns.Code, out var code))
            {
                Code = code;
            }

            if (schema.TryGet(MedicationRequestColumns.Coding, out var coding))
            {
                Coding = coding;
            }

            if (schema.TryGet(MedicationRequestColumns.EncounterId, out var encounterId))
            {
                EncounterId = encounterId;
            }

            if (schema.TryGet(MedicationRequestColumns.Form, out var form))
            {
                Form = form;
            }

            if (schema.TryGet(MedicationRequestColumns.Text, out var text))
            {
                Text = text;
            }

            if (schema.TryGet(MedicationRequestColumns.Unit, out var unit))
            {
                Unit = unit;
            }
        }
    }

    public sealed class AllergyMarshalPlan : MarshalPlan
    {
        public SchemaField Category { get; set; }
        public SchemaField Code { get; set; }
        public SchemaField Coding { get; set; }
        public SchemaField EncounterId { get; set; }
        public SchemaField OnsetDateTime { get; set; }
        public SchemaField RecordedDate { get; set; }
        public SchemaField Text { get; set; }

        public AllergyMarshalPlan()
        {

        }

        public AllergyMarshalPlan(DatasetResultSchema schema) : base(schema)
        {
            if (schema.TryGet(AllergyColumns.Category, out var category))
            {
                Category = category;
            }

            if (schema.TryGet(AllergyColumns.Code, out var code))
            {
                Code = code;
            }

            if (schema.TryGet(AllergyColumns.Coding, out var coding))
            {
                Coding = coding;
            }

            if (schema.TryGet(AllergyColumns.EncounterId, out var encounterId))
            {
                EncounterId = encounterId;
            }

            if (schema.TryGet(AllergyColumns.OnsetDateTime, out var onsetDateTime))
            {
                OnsetDateTime = onsetDateTime;
            }

            if (schema.TryGet(AllergyColumns.RecordedDate, out var recordedDate))
            {
                RecordedDate = recordedDate;
            }

            if (schema.TryGet(AllergyColumns.Text, out var text))
            {
                Text = text;
            }
        }
    }

    public sealed class ImmunizationMarshalPlan : MarshalPlan
    {
        public SchemaField Coding { get; set; }
        public SchemaField DoseQuantity { get; set; }
        public SchemaField DoseUnit { get; set; }
        public SchemaField EncounterId { get; set; }
        public SchemaField OccurrenceDateTime { get; set; }
        public SchemaField Route { get; set; }
        public SchemaField Text { get; set; }
        public SchemaField VaccineCode { get; set; }

        public ImmunizationMarshalPlan()
        {

        }

        public ImmunizationMarshalPlan(DatasetResultSchema schema) : base(schema)
        {
            if (schema.TryGet(ImmunizationColumns.Coding, out var coding))
            {
                Coding = coding;
            }

            if (schema.TryGet(ImmunizationColumns.DoseQuantity, out var doseQuantity))
            {
                DoseQuantity = doseQuantity;
            }

            if (schema.TryGet(ImmunizationColumns.DoseUnit, out var doseUnit))
            {
                DoseUnit = doseUnit;
            }

            if (schema.TryGet(ImmunizationColumns.EncounterId, out var encounterId))
            {
                EncounterId = encounterId;
            }

            if (schema.TryGet(ImmunizationColumns.OccurrenceDateTime, out var occurrenceDateTime))
            {
                OccurrenceDateTime = occurrenceDateTime;
            }

            if (schema.TryGet(ImmunizationColumns.Route, out var route))
            {
                Route = route;
            }

            if (schema.TryGet(ImmunizationColumns.Text, out var text))
            {
                Text = text;
            }

            if (schema.TryGet(ImmunizationColumns.VaccineCode, out var vaccineCode))
            {
                VaccineCode = vaccineCode;
            }
        }
    }

    public sealed class ProcedureMarshalPlan : MarshalPlan
    {
        public SchemaField Category { get; set; }
        public SchemaField Code { get; set; }
        public SchemaField Coding { get; set; }
        public SchemaField EncounterId { get; set; }
        public SchemaField PerformedDateTime { get; set; }
        public SchemaField Text { get; set; }

        public ProcedureMarshalPlan()
        {

        }

        public ProcedureMarshalPlan(DatasetResultSchema schema) : base(schema)
        {
            if (schema.TryGet(ProcedureColumns.Category, out var category))
            {
                Category = category;
            }

            if (schema.TryGet(ProcedureColumns.Code, out var code))
            {
                Code = code;
            }

            if (schema.TryGet(ProcedureColumns.Coding, out var coding))
            {
                Coding = coding;
            }

            if (schema.TryGet(ProcedureColumns.EncounterId, out var encounterId))
            {
                EncounterId = encounterId;
            }

            if (schema.TryGet(ProcedureColumns.PerformedDateTime, out var performedDateTime))
            {
                PerformedDateTime = performedDateTime;
            }

            if (schema.TryGet(ProcedureColumns.Text, out var text))
            {
                Text = text;
            }
        }
    }

    public sealed class ConditionMarshalPlan : MarshalPlan
    {
        public SchemaField AbatementDateTime { get; set; }
        public SchemaField Category { get; set; }
        public SchemaField Code { get; set; }
        public SchemaField Coding { get; set; }
        public SchemaField EncounterId { get; set; }
        public SchemaField OnsetDateTime { get; set; }
        public SchemaField RecordedDate { get; set; }
        public SchemaField Text { get; set; }

        public ConditionMarshalPlan()
        {

        }

        public ConditionMarshalPlan(DatasetResultSchema schema) : base(schema)
        {
            if (schema.TryGet(ConditionColumns.AbatementDateTime, out var abatementDateTime))
            {
                AbatementDateTime = abatementDateTime;
            }

            if (schema.TryGet(ConditionColumns.Category, out var category))
            {
                Category = category;
            }

            if (schema.TryGet(ConditionColumns.Code, out var code))
            {
                Code = code;
            }

            if (schema.TryGet(ConditionColumns.Coding, out var coding))
            {
                Coding = coding;
            }

            if (schema.TryGet(ConditionColumns.EncounterId, out var encounterId))
            {
                EncounterId = encounterId;
            }

            if (schema.TryGet(ConditionColumns.OnsetDateTime, out var onsetDateTime))
            {
                OnsetDateTime = onsetDateTime;
            }

            if (schema.TryGet(ConditionColumns.RecordedDate, out var recordedDate))
            {
                RecordedDate = recordedDate;
            }

            if (schema.TryGet(ConditionColumns.Text, out var text))
            {
                Text = text;
            }
        }
    }

    public sealed class ObservationMarshalPlan : MarshalPlan
    {
        public SchemaField Category { get; set; }
        public SchemaField Code { get; set; }
        public SchemaField EffectiveDate { get; set; }
        public SchemaField EncounterId { get; set; }
        public SchemaField ReferenceRangeLow { get; set; }
        public SchemaField ReferenceRangeHigh { get; set; }
        public SchemaField SpecimenType { get; set; }
        public SchemaField ValueString { get; set; }
        public SchemaField ValueQuantity { get; set; }
        public SchemaField ValueUnit { get; set; }

        public ObservationMarshalPlan()
        {

        }

        public ObservationMarshalPlan(DatasetResultSchema schema) : base(schema)
        {
            if (schema.TryGet(ObservationColumns.Category, out var category))
            {
                Category = category;
            }

            if (schema.TryGet(ObservationColumns.Code, out var code))
            {
                Code = code;
            }

            if (schema.TryGet(ObservationColumns.EffectiveDate, out var effectiveDate))
            {
                EffectiveDate = effectiveDate;
            }

            if (schema.TryGet(ObservationColumns.EncounterId, out var encounterId))
            {
                EncounterId = encounterId;
            }

            if (schema.TryGet(ObservationColumns.ReferenceRangeLow, out var rrlow))
            {
                ReferenceRangeLow = rrlow;
            }

            if (schema.TryGet(ObservationColumns.ReferenceRangeHigh, out var rrhigh))
            {
                ReferenceRangeHigh = rrhigh;
            }

            if (schema.TryGet(ObservationColumns.SpecimenType, out var spec))
            {
                SpecimenType = spec;
            }

            if (schema.TryGet(ObservationColumns.ValueString, out var vs))
            {
                ValueString = vs;
            }

            if (schema.TryGet(ObservationColumns.ValueQuantity, out var vq))
            {
                ValueQuantity = vq;
            }

            if (schema.TryGet(ObservationColumns.ValueUnit, out var vu))
            {
                ValueUnit = vu;
            }
        }
    }

    public sealed class EncounterMarshalPlan : MarshalPlan
    {
        public SchemaField AdmitDate { get; set; }
        public SchemaField AdmitSource { get; set; }
        public SchemaField Class { get; set; }
        public SchemaField DischargeDate { get; set; }
        public SchemaField DischargeDisposition { get; set; }
        public SchemaField EncounterId { get; set; }
        public SchemaField Location { get; set; }
        public SchemaField Status { get; set; }

        public EncounterMarshalPlan()
        {

        }

        public EncounterMarshalPlan(DatasetResultSchema schema) : base(schema)
        {
            if (schema.TryGet(EncounterColumns.AdmitDate, out var admitDate))
            {
                AdmitDate = admitDate;
            }

            if (schema.TryGet(EncounterColumns.AdmitSource, out var admitSource))
            {
                AdmitSource = admitSource;
            }

            if (schema.TryGet(EncounterColumns.Class, out var cls))
            {
                Class = cls;
            }

            if (schema.TryGet(EncounterColumns.DischargeDate, out var dischargeDate))
            {
                DischargeDate = dischargeDate;
            }

            if (schema.TryGet(EncounterColumns.DischargeDisposition, out var dischargeDisposition))
            {
                DischargeDisposition = dischargeDisposition;
            }

            if (schema.TryGet(EncounterColumns.EncounterId, out var encounterId))
            {
                EncounterId = encounterId;
            }

            if (schema.TryGet(EncounterColumns.Location, out var location))
            {
                Location = location;
            }

            if (schema.TryGet(EncounterColumns.Status, out var status))
            {
                Status = status;
            }
        }
    }

    public sealed class DemographicMarshalPlan : MarshalPlan
    {
        public SchemaField Exported { get; set; }
        public SchemaField AddressPostalCode { get; set; }
        public SchemaField AddressState { get; set; }
        public SchemaField Ethnicity { get; set; }
        public SchemaField Gender { get; set; }
        public SchemaField Language { get; set; }
        public SchemaField MaritalStatus { get; set; }
        public SchemaField Race { get; set; }
        public SchemaField Religion { get; set; }
        public SchemaField IsMarried { get; set; }
        public SchemaField IsHispanic { get; set; }
        public SchemaField IsDeceased { get; set; }
        public SchemaField BirthDate { get; set; }
        public SchemaField DeathDate { get; set; }
        public SchemaField Name { get; set; }
        public SchemaField Mrn { get; set; }

        public DemographicMarshalPlan()
        {

        }

        public DemographicMarshalPlan(DatasetResultSchema schema) : base(schema)
        {
            if (schema.TryGet(DemographicColumns.Exported, out var exported))
            {
                Exported = exported;
            }

            if (schema.TryGet(DemographicColumns.AddressPostalCode, out var addressPostalCode))
            {
                AddressPostalCode = addressPostalCode;
            }

            if (schema.TryGet(DemographicColumns.AddressState, out var addressState))
            {
                AddressState = addressState;
            }

            if (schema.TryGet(DemographicColumns.Ethnicity, out var ethnicity))
            {
                Ethnicity = ethnicity;
            }

            if (schema.TryGet(DemographicColumns.Gender, out var gender))
            {
                Gender = gender;
            }

            if (schema.TryGet(DemographicColumns.Language, out var language))
            {
                Language = language;
            }

            if (schema.TryGet(DemographicColumns.MaritalStatus, out var maritalStatus))
            {
                MaritalStatus = maritalStatus;
            }

            if (schema.TryGet(DemographicColumns.Race, out var race))
            {
                Race = race;
            }

            if (schema.TryGet(DemographicColumns.Religion, out var religion))
            {
                Religion = religion;
            }

            if (schema.TryGet(DemographicColumns.IsMarried, out var isMarried))
            {
                IsMarried = isMarried;
            }

            if (schema.TryGet(DemographicColumns.IsHispanic, out var isHispanic))
            {
                IsHispanic = isHispanic;
            }

            if (schema.TryGet(DemographicColumns.IsDeceased, out var isDeceased))
            {
                IsDeceased = isDeceased;
            }

            if (schema.TryGet(DemographicColumns.BirthDate, out var birthDate))
            {
                BirthDate = birthDate;
            }

            if (schema.TryGet(DemographicColumns.DeathDate, out var deathDate))
            {
                DeathDate = deathDate;
            }

            if (schema.TryGet(DemographicColumns.Name, out var name))
            {
                Name = name;
            }

            if (schema.TryGet(DemographicColumns.Mrn, out var mrn))
            {
                Mrn = mrn;
            }
        }
    }
}
