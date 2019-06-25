/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PatientListDatasetDefinitionTemplate, PatientListDatasetShape } from "./Dataset";
import { PatientListColumnType } from "./Column";

// https://www.hl7.org/fhir/person.html
// https://www.hl7.org/fhir/patient.html
export const DemographicsDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        ['personId', { datasetId: 'demographics', id: 'personId', autoDisplayOnLoad: true, type: PatientListColumnType.string }],
        ['patientOf', { datasetId: 'demographics', id: 'patientOf',autoDisplayOnLoad: true, type: PatientListColumnType.string }],
        ['addressPostalCode', { datasetId: 'demographics', id: 'addressPostalCode', autoDisplayOnLoad: true, type: PatientListColumnType.string }],
        ['addressState', { datasetId: 'demographics', id: 'addressState', autoDisplayOnLoad: true, type: PatientListColumnType.string }],
        ['age', { datasetId: 'demographics', id: 'age', autoDisplayOnLoad: true, type: PatientListColumnType.number }],
        ['ethnicity', { datasetId: 'demographics', id: 'ethnicity', autoDisplayOnLoad: true, type: PatientListColumnType.string }],
        ['birthDate', { datasetId: 'demographics', id: 'birthDate', autoDisplayOnLoad: true, type: PatientListColumnType.date, optional: true }],
        ['deceasedDateTime', { datasetId: 'demographics', id: 'deceasedDateTime', autoDisplayOnLoad: true, type: PatientListColumnType.date, optional: true }],
        ['gender', { datasetId: 'demographics', id: 'gender', autoDisplayOnLoad: true, type: PatientListColumnType.string }],
        ['language', { datasetId: 'demographics', id: 'language', autoDisplayOnLoad: true, type: PatientListColumnType.string }],
        ['maritalStatus', { datasetId: 'demographics', id: 'maritalStatus', autoDisplayOnLoad: true, type: PatientListColumnType.string }],
        ['mrn', { datasetId: 'demographics', id: 'mrn', autoDisplayOnLoad: true, type: PatientListColumnType.date, optional: true }],
        ['name', { datasetId: 'demographics', id: 'name', autoDisplayOnLoad: true, type: PatientListColumnType.date, optional: true }],
        ['race', { datasetId: 'demographics', id: 'race', autoDisplayOnLoad: true, type: PatientListColumnType.string }],
        ['religion', { datasetId: 'demographics', id: 'religion', autoDisplayOnLoad: true, type: PatientListColumnType.string }]
    ]),
    multirow: false,
    shape: PatientListDatasetShape.Demographics
};

export const DemographicsAdminSqlDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        ['addressPostalCode', { datasetId: 'demographics', id: 'addressPostalCode', type: PatientListColumnType.string }],
        ['addressState', { datasetId: 'demographics', id: 'addressState', type: PatientListColumnType.string }],
        ['birthDate', { datasetId: 'demographics', id: 'birthDate', type: PatientListColumnType.date }],
        ['deceasedDateTime', { datasetId: 'demographics', id: 'deceasedDateTime', autoDisplayOnLoad: true, type: PatientListColumnType.date }],
        ['ethnicity', { datasetId: 'demographics', id: 'ethnicity', type: PatientListColumnType.string }],
        ['gender', { datasetId: 'demographics', id: 'gender', type: PatientListColumnType.string }],
        ['deceasedBoolean', { datasetId: 'demographics', id: 'deceasedBoolean', type: PatientListColumnType.boolean }],
        ['hispanicBoolean', { datasetId: 'demographics', id: 'hispanicBoolean', type: PatientListColumnType.boolean }],
        ['marriedBoolean', { datasetId: 'demographics', id: 'marriedBoolean', type: PatientListColumnType.boolean }],
        ['language', { datasetId: 'demographics', id: 'language', type: PatientListColumnType.string }],
        ['maritalStatus', { datasetId: 'demographics', id: 'maritalStatus', type: PatientListColumnType.string }],
        ['mrn', { datasetId: 'demographics', id: 'mrn', type: PatientListColumnType.date }],
        ['name', { datasetId: 'demographics', id: 'name', type: PatientListColumnType.date }],
        ['race', { datasetId: 'demographics', id: 'race', type: PatientListColumnType.string }],
        ['religion', { datasetId: 'demographics', id: 'religion', type: PatientListColumnType.string }]
    ]),
    multirow: false,
    shape: PatientListDatasetShape.Demographics
};

// https://www.hl7.org/fhir/encounter.html
export const EncounterDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        ['admitDate', { id: 'admitDate', type: PatientListColumnType.date }],
        ['admitSource', { id: 'admitSource', type: PatientListColumnType.string, optional: true }],
        ['class', { id: 'class', type: PatientListColumnType.string }],
        ['dischargeDate', { id: 'dischargeDate', type: PatientListColumnType.date }],
        ['dischargeDisposition', { id: 'dischargeDisposition', type: PatientListColumnType.string, optional: true }],
        ['encounterId', { id: 'encounterId', type: PatientListColumnType.string }],
        ['location', { id: 'location', type: PatientListColumnType.string }],
        ['status', { id: 'status', type: PatientListColumnType.string, optional: true }]
    ]),
    dateValueColumn: 'admitDate',
    multirow: true,
    shape: PatientListDatasetShape.Encounter,
    stringValueColumn: 'location'
};

// https://www.hl7.org/fhir/observation.html
export const ObservationDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        ['category', { id: 'category', type: PatientListColumnType.string }],
        ['code', { id: 'code', type: PatientListColumnType.string }],
        ['effectiveDate', { id: 'effectiveDate', type: PatientListColumnType.date }],
        ['encounterId', { id: 'encounterId', type: PatientListColumnType.string }],
        ['referenceRangeLow', { id: 'referenceRangeLow', type: PatientListColumnType.number, optional: true }],
        ['referenceRangeHigh', { id: 'referenceRangeHigh', type: PatientListColumnType.number, optional: true }],
        ['specimentType', { id: 'specimenType', type: PatientListColumnType.string, optional: true }],
        ['valueString', { id: 'valueString', type: PatientListColumnType.string }],
        ['valueQuantity', { id: 'valueQuantity', type: PatientListColumnType.number, optional: true }],
        ['valueUnit', { id: 'valueUnit', type: PatientListColumnType.string, optional: true }]
    ]),
    dateValueColumn: 'effectiveDate',
    multirow: true,
    numericValueColumn: 'valueQuantity',
    shape: PatientListDatasetShape.Observation,
    stringValueColumn: 'valueString'
};

// https://www.hl7.org/fhir/condition.html
export const ConditionDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        ['abatementDateTime', { id: 'abatementDateTime', type: PatientListColumnType.number, optional: true }],
        ['category', { id: 'category', type: PatientListColumnType.string }],
        ['code', { id: 'code', type: PatientListColumnType.string }],
        ['coding', { id: 'coding', type: PatientListColumnType.string }],
        ['encounterId', { id: 'encounterId', type: PatientListColumnType.string }],
        ['onsetDateTime', { id: 'onsetDateTime', type: PatientListColumnType.date }],
        ['recordedDate', { id: 'recordedDate', type: PatientListColumnType.number, optional: true }],
        ['text', { id: 'text', type: PatientListColumnType.string }],
    ]),
    dateValueColumn: 'onsetDateTime',
    multirow: true,
    shape: PatientListDatasetShape.Condition,
    stringValueColumn: 'code'
};

// https://www.hl7.org/fhir/procedure.html
export const ProcedureDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        ['category', { id: 'category', type: PatientListColumnType.string }],
        ['code', { id: 'code', type: PatientListColumnType.string }],
        ['coding', { id: 'coding', type: PatientListColumnType.string }],
        ['encounterId', { id: 'encounterId', type: PatientListColumnType.string }],
        ['performedDateTime', { id: 'performedDateTime', type: PatientListColumnType.date }],
        ['text', { id: 'text', type: PatientListColumnType.string }],
    ]),
    dateValueColumn: 'performedDateTime',
    multirow: true,
    shape: PatientListDatasetShape.Procedure,
    stringValueColumn: 'code'
};

// https://www.hl7.org/fhir/immunization.html
export const ImmunizationDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        ['coding', { id: 'coding', type: PatientListColumnType.string }],
        ['doseQuantity', { id: 'doseQuantity', type: PatientListColumnType.number, optional: true }],
        ['doseUnit', { id: 'doseUnit', type: PatientListColumnType.string, optional: true }],
        ['encounterId', { id: 'encounterId', type: PatientListColumnType.string }],
        ['occurrenceDateTime', { id: 'occurrenceDateTime', type: PatientListColumnType.date }],
        ['route', { id: 'route', type: PatientListColumnType.string, optional: true }],
        ['text', { id: 'text', type: PatientListColumnType.string }],
        ['vaccineCode', { id: 'vaccineCode', type: PatientListColumnType.string }]
    ]),
    dateValueColumn: 'occurrenceDateTime',
    multirow: true,
    shape: PatientListDatasetShape.Immunization,
    stringValueColumn: 'vaccineCode'
};

// https://www.hl7.org/fhir/allergyintolerance.html
export const AllergyDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        ['category', { id: 'category', type: PatientListColumnType.string }],
        ['code', { id: 'code', type: PatientListColumnType.string }],
        ['coding', { id: 'coding', type: PatientListColumnType.string }],
        ['encounterId', { id: 'encounterId', type: PatientListColumnType.string }],
        ['onsetDateTime', { id: 'onsetDateTime', type: PatientListColumnType.date }],
        ['recordedDate', { id: 'recordedDate', type: PatientListColumnType.number, optional: true }],
        ['text', { id: 'text', type: PatientListColumnType.string }],
    ]),
    dateValueColumn: 'onsetDateTime',
    multirow: true,
    shape: PatientListDatasetShape.Allergy,
    stringValueColumn: 'text'
};

// https://www.hl7.org/fhir/medicationrequest.html
export const MedRequestDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        ['amount', { id: 'amount', type: PatientListColumnType.number, optional: true }],
        ['authoredOn', { id: 'authoredOn', type: PatientListColumnType.date }],
        ['category', { id: 'category', type: PatientListColumnType.string }],
        ['code', { id: 'code', type: PatientListColumnType.string }],
        ['coding', { id: 'coding', type: PatientListColumnType.string }],
        ['encounterId', { id: 'encounterId', type: PatientListColumnType.string }],
        ['form', { id: 'form', type: PatientListColumnType.string, optional: true }],
        ['text', { id: 'text', type: PatientListColumnType.string }],
        ['unit', { id: 'unit', type: PatientListColumnType.string, optional: true }]
    ]),
    dateValueColumn: 'authoredOn',
    multirow: true,
    shape: PatientListDatasetShape.MedicationRequest,
    stringValueColumn: 'text'
};

// https://www.hl7.org/fhir/medicationadministration.html
export const MedAdminDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        ['code', { id: 'code', type: PatientListColumnType.string }],
        ['coding', { id: 'coding', type: PatientListColumnType.string }],
        ['doseQuantity', { id: 'doseQuantity', type: PatientListColumnType.number, optional: true }],
        ['doseUnit', { id: 'doseUnit', type: PatientListColumnType.string, optional: true }],
        ['encounterId', { id: 'encounterId', type: PatientListColumnType.string }],
        ['effectiveDateTime', { id: 'effectiveDateTime', type: PatientListColumnType.date }],
        ['route', { id: 'route', type: PatientListColumnType.string, optional: true }],
        ['text', { id: 'text', type: PatientListColumnType.string }]
    ]),
    dateValueColumn: 'effectiveDateTime',
    multirow: true,
    shape: PatientListDatasetShape.MedicationAdministration,
    stringValueColumn: 'code'
};

export const DefTemplates: Map<PatientListDatasetShape, PatientListDatasetDefinitionTemplate> = new Map([
    [PatientListDatasetShape.Demographics, DemographicsDefTemplate],
    [PatientListDatasetShape.Encounter, EncounterDefTemplate],
    [PatientListDatasetShape.Observation, ObservationDefTemplate],
    [PatientListDatasetShape.Condition, ConditionDefTemplate],
    [PatientListDatasetShape.Procedure, ProcedureDefTemplate],
    [PatientListDatasetShape.Immunization, ImmunizationDefTemplate],
    [PatientListDatasetShape.Allergy, AllergyDefTemplate],
    [PatientListDatasetShape.MedicationRequest, MedRequestDefTemplate],
    [PatientListDatasetShape.MedicationAdministration, MedAdminDefTemplate],
]);
