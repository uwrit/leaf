/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../../models/state/AppState';
import { HttpFactory } from './../HttpFactory';
import { AdminDatasetQuery } from '../../models/admin/Dataset';
import { PatientListDatasetShape } from '../../models/patientList/Dataset';
import { sleep } from '../../utils/Sleep';

// DEV EXAMPLES
const demographics: AdminDatasetQuery = {
    id: '',
    constraints: [],
    name: 'Basic Demographics',
    shape: PatientListDatasetShape.Demographics,
    sql: "SELECT personId = cast(p.person_id as nvarchar), addressPostalCode = l.zip, addressState = p.location_state, ethnicity = p.ethnicity, gender = CASE WHEN p.gender = 'F' THEN 'female' WHEN p.gender = 'M' THEN 'male' ELSE 'other' END, [language] = 'Unknown', maritalStatus = 'Unknown', race = p.race, religion = 'Unknown', marriedBoolean = cast(0 as bit), hispanicBoolean = cast(CASE WHEN p.ethnicity_code = 38003563 THEN 1 ELSE 0 END as bit), deceasedBoolean = cast(CASE WHEN p.death_date IS NULL THEN 0 ELSE 1 END as bit), birthDate = p.birth_datetime, deceasedDateTime = p.death_date, [name] = 'Unknown Unknown', mrn = 'abc12345' FROM v_person p JOIN person ps on p.person_id = ps.person_id LEFT JOIN [location] l on ps.location_id = l.location_id",
    tags: []
};
const encounter: AdminDatasetQuery = {
    id: '8490433e-f36b-1410-8127-00ffffffffff',
    categoryId: 1,
    constraints: [],
    name: 'Encounters',
    shape: PatientListDatasetShape.Encounter,
    sql: "SELECT      personId = CONVERT(NVARCHAR(10),e.person_id)	, encounterId = CONVERT(NVARCHAR(10),e.visit_occurrence_id)	, admitDate = e.visit_start_date    , class = e.visit_type	, dischargeDate = e.visit_end_date	, [location] = 'Unknown'	, [status] = 'Unknown'  FROM dbo.v_encounter e  WHERE e.visit_type_code IN ('IP','OP')",
    tags: []
};
const platelet: AdminDatasetQuery = {
    id: '7d90433e-f36b-1410-8127-00ffffffffff',
    categoryId: 2,
    constraints: [],
    name: 'Platelet Count',
    shape: PatientListDatasetShape.Observation,
    sql: "SELECT personId      = CAST(SUBJECT_ID AS NVARCHAR), encounterId   = CAST(HADM_ID AS NVARCHAR), category      = 'lab', code          = LOINC_CODE, effectiveDate = DATEADD(YEAR,-150,CAST(CHARTTIME AS DATETIME))  , valueString   = VALUE, valueQuantity = VALUENUM, valueUnit     = VALUEUOM FROM [dbo].[v_LABEVENTS] WHERE LABEL = 'Platelet Count'",
    tags: []
};
const procedure: AdminDatasetQuery = {
    id: 'b18e4b63-be42-e911-9d09-b886875607d2',
    categoryId: 3,
    constraints: [],
    name: 'Procedures',
    shape: PatientListDatasetShape.Procedure,
    sql: "SELECT      personId = CONVERT(NVARCHAR(10),p.person_id)	, encounterId = CONVERT(NVARCHAR(10),p.visit_occurrence_id)	, category = 'procedure'	, code = p.procedure_source_value	, coding = p.procedure_vocabulary_id	, performedDateTime = p.procedure_date	, [text] = p.[procedure_name]FROM dbo.v_procedure p",
    tags: []
};

/*
 * Gets a Dataset.
 */ 
export const getAdminDataset = async (state: AppState, id: string): Promise<AdminDatasetQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);

    await sleep(1000);
    switch(id) {
        case platelet.id:
            return platelet;
        case encounter.id: 
            return encounter;
        case procedure.id: 
            return procedure;
        default: 
            return encounter;
    }
};

/*
 * Updates an existing Dataset.
 */ 
export const updateDataset = async (state: AppState, dataset: AdminDatasetQuery): Promise<AdminDatasetQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    await sleep(1000);
    return dataset;
};

/*
 * Creates a new Dataset.
 */ 
export const createDataset = async (state: AppState, dataset: AdminDatasetQuery): Promise<AdminDatasetQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    await sleep(1000);
    return dataset;
};

/*
 * Deletes an existing Dataset
 */ 
export const deleteDataset = async (state: AppState, dataset: AdminDatasetQuery) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    await sleep(1000);
};

/*
 * Gets the Demographics Dataset.
 */ 
export const getAdminDemographicsDataset = async (state: AppState): Promise<AdminDatasetQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    await sleep(1000);
    return demographics;
};

/*
 * Updates or Inserts existing Demographics Dataset.
 */ 
export const upsertDemographicsDataset = async (state: AppState, dataset: AdminDatasetQuery): Promise<AdminDatasetQuery> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    await sleep(1000);
    return dataset;
};