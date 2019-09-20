/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Action, Dispatch } from 'redux';
import { AppState } from '../models/state/AppState';
import { ImportOptionsDTO, ImportProgress } from '../models/state/Import';
import { REDCapHttpConnector } from '../services/redcapApi';
import { REDCapEavRecord, REDCapRecord } from '../models/redcapApi/Record';
import { REDCapRecordFormat } from '../models/redcapApi/RecordExportConfiguration';

export const IMPORT_COMPLETE = 'IMPORT_COMPLETE'
export const IMPORT_ERROR = 'IMPORT_ERROR';
export const IMPORT_CLEAR_ERROR_OR_COMPLETE = 'IMPORT_CLEAR_ERROR_OR_COMPLETE';
export const IMPORT_SET_OPTIONS = 'IMPORT_SET_OPTIONS';
export const IMPORT_SET_PROGRESS = 'IMPORT_SET_PROGRESS';
export const IMPORT_TOGGLE_REDCAP_MODAL = 'IMPORT_TOGGLE_REDCAP_MODAL';
export const IMPORT_TOGGLE_MRN_MODAL = 'IMPORT_TOGGLE_MRN_MODAL';

export interface ImportAction {
    importOptions?: ImportOptionsDTO;
    progress?: ImportProgress;
    error?: string;
    type: string;
}

// Asynchronous
/*
 * Attempt to import results from a REDCap instance.
 */
export const importFromREDCap = (token: string) => {
    return async (dispatch: Dispatch<Action<any>>, getState: () => AppState) => {
        startTime = new Date().getTime();
        try {
            /*
             * Initialize params.
             */
            // dispatch(setImportProgress(1, 'Preparing import'));
            const state = getState();
            const { redCap } = state.dataImport;
            const conn = new REDCapHttpConnector(token, redCap.apiURI!);
            const mrnField = 'mrn';
            let recs: REDCapEavRecord[] = [];

            /*
             * Get project info.
             */
            const proj = await conn.getProjectInfo();

            /*
             * Get metadata.
             */
            // dispatch(setImportProgress(2, 'Loading metadata'));
            const forms = await conn.getForms();
            const metadata = await conn.getMetadata();
            const idField = metadata[0].field_name;

            /*
             * Find MRNs.
             */
            const mrns = await conn.getRecords({ fields: [ idField, mrnField ], type: REDCapRecordFormat.Flat }) as REDCapRecord[];

            /*
             * If Classic project.
             */
            if (!proj.is_longitudinal) {

                /*
                 * For each form.
                 */
                for (const form of forms) {
                    const newRecs = await conn.getRecords({ forms: [ form.instrument_name ] }) as REDCapEavRecord[];
                    recs = recs.concat(newRecs);
                }
            }
            /*
             * Else if Longitudinal project and no repeating forms.
             */
            else if (proj.is_longitudinal) {
                const eventMappings = await conn.getEventMappings();
                const nonLongForms = forms.filter(f => eventMappings.findIndex(e => e.form === f.instrument_name) === -1);

                /*
                 * For each non-longitudinal form.
                 */
                for (const form of nonLongForms) {
                    const newRecs = await conn.getRecords({ forms: [ form.instrument_name ] }) as REDCapEavRecord[];
                    recs = recs.concat(newRecs);
                }

                /*
                 * For each event mapping.
                 */
                for (const eventMap of eventMappings) {
                    const newRecs = await conn.getRecords({ events: [ eventMap.unique_event_name ], forms: [ eventMap.form ] }) as REDCapEavRecord[];
                    recs = recs.concat(newRecs);
                }
            }

            console.log(mrns, recs);

        } catch (err) {
            console.log(err);
            dispatch(setImportError());
        }
    };
};

// const importREDCapRecordsBy


// Synchronous
export const toggleImportRedcapModal = (): ImportAction => {
    return {
        type: IMPORT_TOGGLE_REDCAP_MODAL
    };
};

export const toggleImportMrnModal = (): ImportAction => {
    return {
        type: IMPORT_TOGGLE_MRN_MODAL
    };
};

export const setImportOptions = (importOptions: ImportOptionsDTO): ImportAction => {
    return {
        importOptions,
        type: IMPORT_SET_OPTIONS
    };
};

export const setImportError = (): ImportAction => {
    return {
        type: IMPORT_ERROR
    };
};

export const setImportClearErrorOrComplete = (): ImportAction => {
    return {
        type: IMPORT_CLEAR_ERROR_OR_COMPLETE
    };
};

export const setImportProgress = (completed: number, text: string): ImportAction => {
    return {
        progress: {
            completed,
            estimatedSecondsRemaining: calculateImportCompletionTime(completed),
            text
        },
        type: IMPORT_SET_PROGRESS
    };
};

/*
 * Calculate the estimated amount of time remaining for the export
 * based on percent of work completed and elapsed time.
 */
let startTime = 0;
const calculateImportCompletionTime = (percentComplete: number): number => {
    const secondsElapsed = (new Date().getTime() - startTime) / 1000;
    const estimate = Math.round((1 - (percentComplete / 100)) * (secondsElapsed / percentComplete) * 100);
    return secondsElapsed < 1 ? 60 : estimate;
};