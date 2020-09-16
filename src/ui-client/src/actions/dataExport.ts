/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Action, Dispatch } from 'redux';
import { AppState } from '../models/state/AppState';
import { ExportOptionsDTO, ExportProgress } from '../models/state/Export';
import { REDCapProjectExportConfiguration } from '../models/redcapApi/ExportConfiguration';
import { getAllData, getREDCapExportData, getBasicDemographicsCSV, getMultirowDatasetCSV } from '../services/patientListApi';
import { REDCapHttpConnector, requestProjectCreation, getREDCapVersion, repeatableFormsAllowed } from '../services/redcapApi';
import { formatSmallNumber } from '../utils/formatNumber';
import { PatientListDatasetExport } from '../models/patientList/Dataset';

export const EXPORT_COMPLETE = 'EXPORT_COMPLETE';
export const EXPORT_REDCAP_COMPLETE = 'EXPORT_REDCAP_COMPLETE';
export const EXPORT_ERROR = 'EXPORT_ERROR';
export const EXPORT_CLEAR_ERROR_OR_COMPLETE = 'EXPORT_CLEAR_ERROR_OR_COMPLETE';
export const EXPORT_SET_OPTIONS = 'EXPORT_SET_OPTIONS';
export const EXPORT_SET_PROGRESS = 'EXPORT_SET_PROGRESS';

export interface ExportAction {
    exportOptions?: ExportOptionsDTO;
    progress?: ExportProgress;
    url?: string;
    error?: string;
    type: string;
}

// Asynchronous
export const exportToCSV = () => {
    return async(dispatch: Dispatch<Action<any>>, getState: () => AppState) => {
        try {
            const state = getState();
            const datasets = [ ...state.cohort.patientList.configuration.multirowDatasets.values() ];
            const csvCount = datasets.length+1;
            const baseFileName = `leaf_cohort_${Date.now()}_`;
            const initialPct = 10;
            
            /**
             * Get Basic Demographics csv
             */
            dispatch(setExportProgress(initialPct, 'Loading Basic Demographics'));
            const basicDems = await getBasicDemographicsCSV(state);
            downloadCsv(basicDems, baseFileName + 'demographics.csv');

            /**
             * Load remaining datasets sequentially.
             */
            for (let i = 0; i < datasets.length; i++) {
                const ds = datasets[i];
                dispatch(setExportProgress((i / csvCount * 100) - initialPct, `Loading ${ds.displayName}`));
                const dataset = await getMultirowDatasetCSV(state, ds.id);
                downloadCsv(dataset, `${baseFileName}${ds.displayName.toLowerCase()}.csv`);
            }

            dispatch(setExportProgress(100, 'CSV download completed'));
            dispatch(setExportComplete());

        } catch (err) {
            console.log(err);
            dispatch(setExportError());
        }
    };
}

/*
 * Attempt to export results to a REDCap instance. If the REDCap version
 * does not allow repeating forms, this will fall back to a longitudinal
 * style project.
 */
export const exportToREDCap = (projectTitle: string) => {
    return async (dispatch: Dispatch<Action<any>>, getState: () => AppState) => {
        startTime = new Date().getTime();
        try {
            /*
             * Initialize params.
             */
            dispatch(setExportProgress(1, 'Preparing export'));
            const state = getState();
            const { redCap } = state.dataExport;
            const batchSize = redCap.batchSize || 10;
            const username = state.auth.userContext!.name;

            /*
             * Request a new project from the server and retrieve 
             * the associated project token. The token will be used
             * for subsequent API calls.
             */ 
            const versionResp = await getREDCapVersion(state);
            const version = versionResp.data;
            const useRepeatableForms: boolean = repeatableFormsAllowed(version);
            const createResp: any = await requestProjectCreation(state, projectTitle, useRepeatableForms);
            const token = createResp.data as string;
            const conn = new REDCapHttpConnector(token, redCap.apiURI!);

            /*
             * Pull down the patient list, transform for REDCap project.
             */
            const data = await getAllData(state.cohort.patientList.configuration, false) as PatientListDatasetExport[];
            const config = await getREDCapExportData(redCap, data, projectTitle, username, useRepeatableForms) as REDCapProjectExportConfiguration;

            /*
             * Set metadata (fields) from each dataset.
             */
            dispatch(setExportProgress(2, 'Loading metadata'));
            await conn.exportMetadata(config.metadata);

            /*
             * If this REDCap instance supports repeating forms configuration
             * by API, use that, else fall back to longitudinal projects.
             */
            if (useRepeatableForms) {
                dispatch(setExportProgress(3, 'Loading repeatable forms'));
                await conn.exportRepeatingFormsEvents(config.repeatingFormEvents!);
            }
            else {
                dispatch(setExportProgress(3, 'Loading events'));
                await conn.exportEvents(config.events!);

                dispatch(setExportProgress(4, 'Loading event mappings'));
                await conn.exportEventMappings(config.eventMappings!);
            }

            /*
             * Export records in batches. Each row from
             * each patient list dataset becomes a record.
             */
            const totalRecords = config.data.length;
            let startIdx = 0;
            let completed = 4;
            while (startIdx <= totalRecords) {
                /*
                 * Export current batch.
                 */
                const endIdx = startIdx + batchSize;
                const batch = config.data.slice(startIdx, endIdx);
                const displayText = `Exporting ${formatSmallNumber(endIdx < totalRecords ? endIdx : totalRecords)} of ${formatSmallNumber(totalRecords)} records`;
                dispatch(setExportProgress(completed, displayText));
                await conn.exportRecords(batch);

                /*
                 * Increment current index and recalculate
                 * export progress.
                 */
                startIdx += batchSize;
                completed = Math.round(4 + (endIdx / totalRecords * 100 * 0.95));
            }

            /*
             * If we've gotten this far then the project data
             * has loaded correctly, so give access to the
             * user, then retrieve a project url.
             */
            dispatch(setExportProgress(99, 'Adding user permissions'));
            await conn.exportUsers(config.users);

            dispatch(setExportProgress(100, 'Retrieving project link'));
            const url: any = await conn.getProjectUrl(version);

            dispatch(setREDCapUrl(url));
        } catch (err) {
            console.log(err);
            dispatch(setExportError());
        }
    };
};

// Synchronous
export const setExportOptions = (exportOptions: ExportOptionsDTO): ExportAction => {
    return {
        exportOptions,
        type: EXPORT_SET_OPTIONS
    };
};

export const setExportComplete = (): ExportAction => {
    return {
        type: EXPORT_COMPLETE
    };
}

export const setREDCapUrl = (url: string): ExportAction => {
    return {
        type: EXPORT_REDCAP_COMPLETE,
        url
    };
};

export const setExportError = (): ExportAction => {
    return {
        type: EXPORT_ERROR
    };
};

export const setExportClearErrorOrComplete = (): ExportAction => {
    return {
        type: EXPORT_CLEAR_ERROR_OR_COMPLETE
    };
};

export const setExportProgress = (completed: number, text: string): ExportAction => {
    return {
        progress: {
            completed,
            estimatedSecondsRemaining: calculateExportCompletionTime(completed),
            text
        },
        type: EXPORT_SET_PROGRESS
    };
};

/*
 * Calculate the estimated amount of time remaining for the export
 * based on percent of work completed and elapsed time.
 */
let startTime = 0;
const calculateExportCompletionTime = (percentComplete: number): number => {
    const secondsElapsed = (new Date().getTime() - startTime) / 1000;
    const estimate = Math.round((1 - (percentComplete / 100)) * (secondsElapsed / percentComplete) * 100);
    return secondsElapsed < 1 ? 60 : estimate;
};

/*
 * Download a dataset (already transformed to a string) to a CSV file in browser.
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
        window.location.href = 'data:application/octet-stream,' + encodeURIComponent(content);
    }
};