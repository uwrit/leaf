/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { PatientListDatasetDefinitionTemplate, PatientListDatasetShape } from "./Dataset";
import { PatientListColumnType } from "./Column";

export const personId = 'personId';
export const encounterId = 'encounterId';

// https://www.hl7.org/fhir/person.html
// https://www.hl7.org/fhir/patient.html
export const DemographicsDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        [personId, { datasetId: 'demographics', id: personId, autoDisplayOnLoad: true, type: PatientListColumnType.String }],
        ['patientOf', { datasetId: 'demographics', id: 'patientOf',autoDisplayOnLoad: true, type: PatientListColumnType.String }],
        ['addressPostalCode', { datasetId: 'demographics', id: 'addressPostalCode', autoDisplayOnLoad: true, type: PatientListColumnType.String }],
        ['addressState', { datasetId: 'demographics', id: 'addressState', autoDisplayOnLoad: true, type: PatientListColumnType.String }],
        ['age', { datasetId: 'demographics', id: 'age', autoDisplayOnLoad: true, type: PatientListColumnType.Numeric }],
        ['ethnicity', { datasetId: 'demographics', id: 'ethnicity', autoDisplayOnLoad: true, type: PatientListColumnType.String }],
        ['birthDate', { datasetId: 'demographics', id: 'birthDate', autoDisplayOnLoad: true, type: PatientListColumnType.DateTime, optional: true }],
        ['deceasedDateTime', { datasetId: 'demographics', id: 'deceasedDateTime', autoDisplayOnLoad: true, type: PatientListColumnType.DateTime, optional: true }],
        ['gender', { datasetId: 'demographics', id: 'gender', autoDisplayOnLoad: true, type: PatientListColumnType.String }],
        ['language', { datasetId: 'demographics', id: 'language', autoDisplayOnLoad: true, type: PatientListColumnType.String }],
        ['maritalStatus', { datasetId: 'demographics', id: 'maritalStatus', autoDisplayOnLoad: true, type: PatientListColumnType.String }],
        ['mrn', { datasetId: 'demographics', id: 'mrn', autoDisplayOnLoad: true, type: PatientListColumnType.String, optional: true }],
        ['name', { datasetId: 'demographics', id: 'name', autoDisplayOnLoad: true, type: PatientListColumnType.String, optional: true }],
        ['race', { datasetId: 'demographics', id: 'race', autoDisplayOnLoad: true, type: PatientListColumnType.String }],
        ['religion', { datasetId: 'demographics', id: 'religion', autoDisplayOnLoad: true, type: PatientListColumnType.String }]
    ]),
    multirow: false,
    shape: PatientListDatasetShape.Demographics
};

export const DemographicsAdminSqlDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        ['addressPostalCode', { datasetId: 'demographics', id: 'addressPostalCode', type: PatientListColumnType.String }],
        ['addressState', { datasetId: 'demographics', id: 'addressState', type: PatientListColumnType.String }],
        ['birthDate', { datasetId: 'demographics', id: 'birthDate', type: PatientListColumnType.DateTime }],
        ['deceasedDateTime', { datasetId: 'demographics', id: 'deceasedDateTime', autoDisplayOnLoad: true, type: PatientListColumnType.DateTime }],
        ['ethnicity', { datasetId: 'demographics', id: 'ethnicity', type: PatientListColumnType.String }],
        ['gender', { datasetId: 'demographics', id: 'gender', type: PatientListColumnType.String }],
        ['deceasedBoolean', { datasetId: 'demographics', id: 'deceasedBoolean', type: PatientListColumnType.Bool }],
        ['hispanicBoolean', { datasetId: 'demographics', id: 'hispanicBoolean', type: PatientListColumnType.Bool }],
        ['marriedBoolean', { datasetId: 'demographics', id: 'marriedBoolean', type: PatientListColumnType.Bool }],
        ['language', { datasetId: 'demographics', id: 'language', type: PatientListColumnType.String }],
        ['maritalStatus', { datasetId: 'demographics', id: 'maritalStatus', type: PatientListColumnType.String }],
        ['mrn', { datasetId: 'demographics', id: 'mrn', type: PatientListColumnType.DateTime }],
        ['name', { datasetId: 'demographics', id: 'name', type: PatientListColumnType.DateTime }],
        ['race', { datasetId: 'demographics', id: 'race', type: PatientListColumnType.String }],
        ['religion', { datasetId: 'demographics', id: 'religion', type: PatientListColumnType.String }]
    ]),
    multirow: false,
    shape: PatientListDatasetShape.Demographics
};

// https://www.hl7.org/fhir/encounter.html
export const EncounterDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        [encounterId, { id: encounterId, type: PatientListColumnType.String }],
        ['admitDate', { id: 'admitDate', type: PatientListColumnType.DateTime }],
        ['admitSource', { id: 'admitSource', type: PatientListColumnType.String, optional: true }],
        ['class', { id: 'class', type: PatientListColumnType.String }],
        ['dischargeDate', { id: 'dischargeDate', type: PatientListColumnType.DateTime }],
        ['dischargeDisposition', { id: 'dischargeDisposition', type: PatientListColumnType.String, optional: true }],
        ['location', { id: 'location', type: PatientListColumnType.String }],
        ['status', { id: 'status', type: PatientListColumnType.String, optional: true }]
    ]),
    dateValueColumn: 'admitDate',
    multirow: true,
    shape: PatientListDatasetShape.Encounter,
    stringValueColumn: 'location'
};

// https://www.hl7.org/fhir/observation.html
export const ObservationDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        [encounterId, { id: encounterId, type: PatientListColumnType.String }],
        ['category', { id: 'category', type: PatientListColumnType.String }],
        ['code', { id: 'code', type: PatientListColumnType.String }],
        ['effectiveDate', { id: 'effectiveDate', type: PatientListColumnType.DateTime }],
        ['referenceRangeLow', { id: 'referenceRangeLow', type: PatientListColumnType.Numeric, optional: true }],
        ['referenceRangeHigh', { id: 'referenceRangeHigh', type: PatientListColumnType.Numeric, optional: true }],
        ['specimentType', { id: 'specimenType', type: PatientListColumnType.String, optional: true }],
        ['valueString', { id: 'valueString', type: PatientListColumnType.String }],
        ['valueQuantity', { id: 'valueQuantity', type: PatientListColumnType.Numeric, optional: true }],
        ['valueUnit', { id: 'valueUnit', type: PatientListColumnType.String, optional: true }]
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
        [encounterId, { id: encounterId, type: PatientListColumnType.String }],
        ['abatementDateTime', { id: 'abatementDateTime', type: PatientListColumnType.DateTime, optional: true }],
        ['category', { id: 'category', type: PatientListColumnType.String }],
        ['code', { id: 'code', type: PatientListColumnType.String }],
        ['coding', { id: 'coding', type: PatientListColumnType.String }],
        ['onsetDateTime', { id: 'onsetDateTime', type: PatientListColumnType.DateTime }],
        ['recordedDate', { id: 'recordedDate', type: PatientListColumnType.DateTime, optional: true }],
        ['text', { id: 'text', type: PatientListColumnType.String }],
    ]),
    dateValueColumn: 'onsetDateTime',
    multirow: true,
    shape: PatientListDatasetShape.Condition,
    stringValueColumn: 'code'
};

// https://www.hl7.org/fhir/procedure.html
export const ProcedureDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        [encounterId, { id: encounterId, type: PatientListColumnType.String }],
        ['category', { id: 'category', type: PatientListColumnType.String }],
        ['code', { id: 'code', type: PatientListColumnType.String }],
        ['coding', { id: 'coding', type: PatientListColumnType.String }],
        ['performedDateTime', { id: 'performedDateTime', type: PatientListColumnType.DateTime }],
        ['text', { id: 'text', type: PatientListColumnType.String }],
    ]),
    dateValueColumn: 'performedDateTime',
    multirow: true,
    shape: PatientListDatasetShape.Procedure,
    stringValueColumn: 'code'
};

// https://www.hl7.org/fhir/immunization.html
export const ImmunizationDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        [encounterId, { id: encounterId, type: PatientListColumnType.String }],
        ['coding', { id: 'coding', type: PatientListColumnType.String }],
        ['doseQuantity', { id: 'doseQuantity', type: PatientListColumnType.Numeric, optional: true }],
        ['doseUnit', { id: 'doseUnit', type: PatientListColumnType.String, optional: true }],
        ['occurrenceDateTime', { id: 'occurrenceDateTime', type: PatientListColumnType.DateTime }],
        ['route', { id: 'route', type: PatientListColumnType.String, optional: true }],
        ['text', { id: 'text', type: PatientListColumnType.String }],
        ['vaccineCode', { id: 'vaccineCode', type: PatientListColumnType.String }]
    ]),
    dateValueColumn: 'occurrenceDateTime',
    multirow: true,
    shape: PatientListDatasetShape.Immunization,
    stringValueColumn: 'vaccineCode'
};

// https://www.hl7.org/fhir/allergyintolerance.html
export const AllergyDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        [encounterId, { id: encounterId, type: PatientListColumnType.String }],
        ['category', { id: 'category', type: PatientListColumnType.String }],
        ['code', { id: 'code', type: PatientListColumnType.String }],
        ['coding', { id: 'coding', type: PatientListColumnType.String }],
        ['onsetDateTime', { id: 'onsetDateTime', type: PatientListColumnType.DateTime }],
        ['recordedDate', { id: 'recordedDate', type: PatientListColumnType.DateTime, optional: true }],
        ['text', { id: 'text', type: PatientListColumnType.String }],
    ]),
    dateValueColumn: 'onsetDateTime',
    multirow: true,
    shape: PatientListDatasetShape.Allergy,
    stringValueColumn: 'text'
};

// https://www.hl7.org/fhir/medicationrequest.html
export const MedRequestDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        [encounterId, { id: encounterId, type: PatientListColumnType.String }],
        ['amount', { id: 'amount', type: PatientListColumnType.Numeric, optional: true }],
        ['authoredOn', { id: 'authoredOn', type: PatientListColumnType.DateTime }],
        ['category', { id: 'category', type: PatientListColumnType.String }],
        ['code', { id: 'code', type: PatientListColumnType.String }],
        ['coding', { id: 'coding', type: PatientListColumnType.String }],
        ['form', { id: 'form', type: PatientListColumnType.String, optional: true }],
        ['text', { id: 'text', type: PatientListColumnType.String }],
        ['unit', { id: 'unit', type: PatientListColumnType.String, optional: true }]
    ]),
    dateValueColumn: 'authoredOn',
    multirow: true,
    shape: PatientListDatasetShape.MedicationRequest,
    stringValueColumn: 'text'
};

// https://www.hl7.org/fhir/medicationadministration.html
export const MedAdminDefTemplate: PatientListDatasetDefinitionTemplate = {
    columns: new Map([
        [encounterId, { id: encounterId, type: PatientListColumnType.String }],
        ['code', { id: 'code', type: PatientListColumnType.String }],
        ['coding', { id: 'coding', type: PatientListColumnType.String }],
        ['doseQuantity', { id: 'doseQuantity', type: PatientListColumnType.Numeric, optional: true }],
        ['doseUnit', { id: 'doseUnit', type: PatientListColumnType.String, optional: true }],
        ['effectiveDateTime', { id: 'effectiveDateTime', type: PatientListColumnType.DateTime }],
        ['route', { id: 'route', type: PatientListColumnType.String, optional: true }],
        ['text', { id: 'text', type: PatientListColumnType.String }]
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
