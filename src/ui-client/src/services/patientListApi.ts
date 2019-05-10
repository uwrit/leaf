/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../models/state/AppState';
import { PatientListState, CohortStateType } from '../models/state/CohortState';
import { REDCapExportOptions } from '../models/state/Export';
import PatientListWebWorker from '../providers/patientList/patientListWebWorker';
import REDCapExportWebWorker from '../providers/redcapExport/redcapExportWebWorker';
import camelCaseToUpperSpaced from '../utils/camelCaseToUpperSpaced';
import { PatientListConfiguration } from '../models/patientList/Configuration';
import { PatientListDatasetDefinition, PatientListDatasetExport, PatientListDatasetDTO, PatientListDataset, PatientListDatasetQueryDTO, PatientListDatasetSummaryType, PatientListDatasetDefinitionTemplate } from '../models/patientList/Dataset';
import { PatientListColumn, PatientListColumnId, PatientListColumnType } from '../models/patientList/Column';
import { PatientListRow, PatientListRowDTO } from '../models/patientList/Patient';
import { DemographicsDefTemplate, DefTemplates } from '../models/patientList/DatasetDefinitionTemplate';

const patientListProvider = new PatientListWebWorker();
const redcapExportProvider = new REDCapExportWebWorker();

/*
 * Returns a patient list (rows with tuples, as arrays) based on the
 * current configuration object.
 */
export const getPatients = (config: PatientListConfiguration) => {
    return patientListProvider.getPatients(config);
};

export const removeDataset = (config: PatientListConfiguration, def: PatientListDatasetDefinition) => {
    return patientListProvider.removeDataset(config, def.id);
};

/*
 * Gets all data, regardless of configuration. This is used for transformation
 * prior to export.
 */
export const getAllData = (config: PatientListConfiguration, useDisplayedColumnsOnly: boolean) => {
    return patientListProvider.getAllData(config, useDisplayedColumnsOnly);
};

/*
 * Transforms patient list data to REDCap objects to prep for export.
 */
export const getREDCapExportData = (
        options: REDCapExportOptions, 
        plData: PatientListDatasetExport[], 
        projectTitle: string, 
        username: string, 
        useRepeatingForms: boolean
    ) => {
    return redcapExportProvider.createProjectConfiguration(options, plData, projectTitle, username, useRepeatingForms);
};

/*
 * Extracts datasets as CSV files. This is not yet fully implemented.
 */
export const getCsvs = async (config: PatientListConfiguration) => {
    /*
    const base: any = await patientListProvider.getSingletonCsv(config, false);
    const pl: any = await patientListProvider.getMultirowCsv('Platelet');

    downloadCsv(base, 'demographics');
    downloadCsv(pl, 'platelets');
    */
};

/*
 * Downloads a dataset (already transformed to a string) to a CSV file in browser.
 */
const downloadCsv = (content: string, fileName: string) => {
    const packageCsv = (csv: string) => new Blob([ csv ], { type: 'text/csv;encoding:utf-8' });
    const a = document.createElement('a');

     // IE10
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(packageCsv(content), fileName);
    } else if (URL && 'download' in a) { 
        a.href = URL.createObjectURL(packageCsv(content));
        a.setAttribute('download', fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        location.href = 'data:application/octet-stream,' + encodeURIComponent(content);
    }
};

/*
 * Tells the web worker to clear all patient list data.
 */
export const clearPreviousPatientList = () => patientListProvider.clearPatients();

/*
 * Adds a multirow dataset, then returns a new patient list.
 */
export const addMultirowDataset = async (
        getState: () => AppState, 
        datasetDto: PatientListDatasetDTO, 
        queryRef: PatientListDatasetQueryDTO, 
        responderId: number
    ): Promise<PatientListState> => {

    const patientList = getState().cohort.patientList;
    const multirowDatasets = patientList.configuration.multirowDatasets;
    const singletonDatasets = patientList.configuration.singletonDatasets;
    const def = getDatasetDefinition(datasetDto, queryRef);
    const dataset: PatientListDataset = {
        data: datasetDto,
        definition: def,
        ...queryRef
    }

    // Add dataset definition
    if (!multirowDatasets.has(def.id)) {
        multirowDatasets.set(def.id, def);
    }
    multirowDatasets.get(def.id)!.responderStates.set(responderId, CohortStateType.LOADED);

    // Update the displayed patients
    const summaryDef = await patientListProvider.addDataset(dataset, responderId) as PatientListDatasetDefinition;

    // If we have a new summary dataset, add to configuration
    if (summaryDef) {
        if (!singletonDatasets.has(summaryDef.id)) {
            singletonDatasets.set(summaryDef.id, summaryDef);
            summaryDef.columns.forEach((col: PatientListColumn) => {
                if (col.isDisplayed) {
                    patientList.configuration.displayColumns.push(col);
                }
            });
        } 
        if (summaryDef.numericValueColumn && datasetDto.schema.fields.indexOf(summaryDef.numericValueColumn) > -1) {
            summaryDef.summaryType = PatientListDatasetSummaryType.Quantitative;
        } else {
            summaryDef.summaryType = PatientListDatasetSummaryType.NonQuantititive;
        }
        summaryDef.summaryType = (def.numericValueColumn && datasetDto.schema.fields.indexOf(def.numericValueColumn!) > -1) 
            ? PatientListDatasetSummaryType.Quantitative 
            : PatientListDatasetSummaryType.NonQuantititive;
        summaryDef.responderStates.set(responderId, CohortStateType.LOADED);
    }

    // Get the latest patient list
    patientList.display = await getPatients(patientList.configuration) as PatientListRow[];
    patientList.totalRows = getState().cohort.patientList.totalRows + summaryDef.totalRows!;
    return patientList;
};

/*
 * Add patient demographics (the base dataset) to the patient list.
 * This has a standalone method different from other datasets because
 * its DTO is a different shape.
 */
export const addDemographicsDataset = async (
        getState: () => AppState, 
        patients: PatientListRowDTO[], 
        responderId: number
    ): Promise<PatientListState> => {
    const state = getState();
    const patientList = state.cohort.patientList;
    const responder = state.responders.get(responderId)!;

    if (!patients.length) { return patientList; }

    // Add the responder name as a column
    for (let i = 0; i < patients.length; i++) {
        const pat = patients[i] as any;
        pat.patientOf = responder.name;
    }

    // Validate definition against actual dataset
    const def = getDemographicsDefinition(patients[0]);

    // Add columns if none are displayed
    if (!patientList.configuration.singletonDatasets.size) {

        // Add columns
        def.columns.forEach((c: PatientListColumn) => {
            c.isDisplayed = true;
            patientList.configuration.displayColumns.push(c);
        });
        patientList.configuration.singletonDatasets.set(def.id, def);
    }

    // Update the displayed patients
    await patientListProvider.addDemographics(def, patients, responderId);
    patientList.display = await patientListProvider.getPatients(patientList.configuration) as PatientListRow[];
    patientList.totalPatients = getState().cohort.patientList.totalPatients + patients.length;
    patientList.state = CohortStateType.LOADED;
    return patientList;
};

/*
 * Validates expected template columns against the return dataset schema.
 */
const validateDefinitionColumns = (
        template: PatientListDatasetDefinitionTemplate,
        actualColNames: string[], 
        datasetId: string
    ): Map<PatientListColumnId, PatientListColumn> => {

    const cols: Map<PatientListColumnId,PatientListColumn> = new Map();
    let i = 0;

    template.columns.forEach((c) => {
        if (actualColNames.indexOf(c.id) !== -1) {
            const col: PatientListColumn = {
                ...c,
                datasetId,
                displayName: c.displayName ? c.displayName : camelCaseToUpperSpaced(c.id),
                index: i,
                isDisplayed: !!c.autoDisplayOnLoad
            };
            cols.set(c.id, col);
            i++;
        }
    })

    /*
    actualColNames.forEach((c: string) => {
        const tempCol = template.columns.get(c);
        if (tempCol) {
            const col: PatientListColumn = {
                ...tempCol,
                datasetId,
                displayName: camelCaseToUpperSpaced(c),
                index: i,
                isDisplayed: !!tempCol.autoDisplayOnLoad
            };
            cols.set(c, col);
            i++;
        }
    });
    */
    return cols;
};

/*
 * Extracts a demographics dataset definition.
 */
const getDemographicsDefinition = (patient: PatientListRowDTO) => {
    const realCols = Object.keys(patient);
    const dsName = 'demographics';
    const dsDisplayName = 'Basic Demographics';
    const def: PatientListDatasetDefinition = {
        ...DemographicsDefTemplate,
        columns: validateDefinitionColumns(DemographicsDefTemplate, realCols, dsName),
        displayName: dsDisplayName,
        id: dsName,
        responderStates: new Map()
    };
    return def;
};

/*
 * Extracts a dataset definition.
 */
const getDatasetDefinition = (dataset: PatientListDatasetDTO, queryRef: PatientListDatasetQueryDTO) => {
    const template = DefTemplates.get(queryRef.shape)!;
    const def: PatientListDatasetDefinition = {
        ...template,
        columns: validateDefinitionColumns(template, dataset.schema.fields, queryRef.name),
        displayName: queryRef.name,
        id: queryRef.id,
        responderStates: new Map()
    };
    return def;
};
