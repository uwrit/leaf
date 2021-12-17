// Copyright (c) 2021, UW Medicine Research IT, University of Washington
// Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
using System;

namespace Model.Compiler
{
    public enum Shape
    {
        Concept = -2,
        Dynamic = -1,
        Observation = 1,
        Encounter = 2,
        Demographic = 3,
        Condition = 4,
        Procedure = 5,
        Immunization = 6,
        Allergy = 7,
        MedicationRequest = 8,
        MedicationAdministration = 9
    }

    public static class DatasetColumns
    {
        public const string Salt = "Salt";
        public const string PersonId = "personId";
        public const string EncounterId = "encounterId";
    }

    public static class ConceptColumns
    {
        public const string PersonId = DatasetColumns.PersonId;
        public const string EncounterId = DatasetColumns.EncounterId;
        public const string DateField = "dateField";
        public const string NumberField = "numberField";
    }

    public static class ObservationColumns
    {
        public const string PersonId = DatasetColumns.PersonId;
        public const string Category = "category";
        public const string Code = "code";
        public const string EffectiveDate = "effectiveDate";
        public const string EncounterId = DatasetColumns.EncounterId;
        public const string ReferenceRangeLow = "referenceRangeLow";
        public const string ReferenceRangeHigh = "referenceRangeHigh";
        public const string SpecimenType = "specimenType";
        public const string ValueString = "valueString";
        public const string ValueQuantity = "valueQuantity";
        public const string ValueUnit = "valueUnit";
    }

    public static class EncounterColumns
    {
        public const string PersonId = DatasetColumns.PersonId;
        public const string EncounterId = DatasetColumns.EncounterId;
        public const string AdmitDate = "admitDate";
        public const string AdmitSource = "admitSource";
        public const string Class = "class";
        public const string DischargeDate = "dischargeDate";
        public const string DischargeDisposition = "dischargeDisposition";
        public const string Location = "location";
        public const string Status = "status";
    }

    public static class DemographicColumns
    {
        public const string Exported = "Exported";
        public const string PersonId = DatasetColumns.PersonId;
        public const string AddressPostalCode = "addressPostalCode";
        public const string AddressState = "addressState";
        public const string Ethnicity = "ethnicity";
        public const string Gender = "gender";
        public const string Language = "language";
        public const string MaritalStatus = "maritalStatus";
        public const string Race = "race";
        public const string Religion = "religion";
        public const string IsMarried = "marriedBoolean";
        public const string IsHispanic = "hispanicBoolean";
        public const string IsDeceased = "deceasedBoolean";
        public const string BirthDate = "birthDate";
        public const string DeathDate = "deceasedDateTime";
        public const string Name = "name";
        public const string Mrn = "mrn";
    }

    public static class ConditionColumns
    {
        public const string PersonId = DatasetColumns.PersonId;
        public const string EncounterId = DatasetColumns.EncounterId;
        public const string AbatementDateTime = "abatementDateTime";
        public const string Category = "category";
        public const string Code = "code";
        public const string Coding = "coding";
        public const string OnsetDateTime = "onsetDateTime";
        public const string RecordedDate = "recordedDate";
        public const string Text = "text";
    }

    public static class ProcedureColumns
    {
        public const string PersonId = DatasetColumns.PersonId;
        public const string EncounterId = DatasetColumns.EncounterId;
        public const string Category = "category";
        public const string Code = "code";
        public const string Coding = "coding";
        public const string PerformedDateTime = "performedDateTime";
        public const string Text = "text";
    }

    public static class ImmunizationColumns
    {
        public const string PersonId = DatasetColumns.PersonId;
        public const string EncounterId = DatasetColumns.EncounterId;
        public const string Coding = "coding";
        public const string DoseQuantity = "doseQuantity";
        public const string DoseUnit = "doseUnit";
        public const string OccurrenceDateTime = "occurrenceDateTime";
        public const string Route = "route";
        public const string Text = "text";
        public const string VaccineCode = "vaccineCode";
    }

    public static class AllergyColumns
    {
        public const string PersonId = DatasetColumns.PersonId;
        public const string EncounterId = DatasetColumns.EncounterId;
        public const string Category = "category";
        public const string Code = "code";
        public const string Coding = "coding";
        public const string OnsetDateTime = "onsetDateTime";
        public const string RecordedDate = "recordedDate";
        public const string Text = "text";
    }

    public static class MedicationRequestColumns
    {
        public const string PersonId = DatasetColumns.PersonId;
        public const string EncounterId = DatasetColumns.EncounterId;
        public const string Amount = "amount";
        public const string AuthoredOn = "authoredOn";
        public const string Category = "category";
        public const string Code = "code";
        public const string Coding = "coding";
        public const string Form = "form";
        public const string Text = "text";
        public const string Unit = "unit";
    }

    public static class MedicationAdministrationColumns
    {
        public const string PersonId = DatasetColumns.PersonId;
        public const string EncounterId = DatasetColumns.EncounterId;
        public const string Code = "code";
        public const string Coding = "coding";
        public const string DoseQuantity = "doseQuantity";
        public const string DoseUnit = "doseUnit";
        public const string EffectiveDateTime = "effectiveDateTime";
        public const string Route = "route";
        public const string Text = "text";
    }
}
