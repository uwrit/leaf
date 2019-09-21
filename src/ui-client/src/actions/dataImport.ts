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
import { REDCapEavRecord } from '../models/redcapApi/Record';
import { REDCapRecordFormat } from '../models/redcapApi/RecordExportConfiguration';
import { REDCapImportConfiguration } from '../models/redcapApi/ImportConfiguration';
import { loadREDCapImportData, calculateREDCapFieldCount } from '../services/dataImport';

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
 * Import results from a REDCap instance.
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
            const { EAV, Flat } = REDCapRecordFormat;
            const conn = new REDCapHttpConnector(token, state.dataImport.redCap.apiURI!);
            const config = initializeREDCapImportConfiguration();

            /*
             * Get project info.
             */
            config.projectInfo = await conn.getProjectInfo();
            config.forms = await conn.getForms();
            config.metadata = await conn.getMetadata();
            config.users = await conn.getUsers();
            config.recordField = config.metadata[0].field_name;
            config.mrns = await conn.getRecords({ fields: [ config.recordField, config.mrnField ], type: Flat });

            /*
             * If Classic project.
             */
            if (!config.projectInfo.is_longitudinal) {

                /*
                 * For each form.
                 */
                for (const form of config.forms) {
                    const newRecs = await conn.getRecords({ forms: [ form.instrument_name ], type: EAV }) as REDCapEavRecord[];
                    config.records = config.records.concat(newRecs);
                }
            }

            /*
             * Else if Longitudinal project.
             */
            else {
                config.eventMappings = await conn.getEventMappings();
                const nonLongForms = config.forms.filter(f => config.eventMappings!.findIndex(e => e.form === f.instrument_name) === -1);

                /*
                 * For each non-longitudinal form.
                 */
                for (const form of nonLongForms) {
                    const newRecs = await conn.getRecords({ forms: [ form.instrument_name ], type: EAV }) as REDCapEavRecord[];
                    config.records = config.records.concat(newRecs);
                }

                /*
                 * For each event mapping.
                 */
                for (const e of config.eventMappings) {
                    const newRecs = await conn.getRecords({ events: [ e.unique_event_name ], forms: [ e.form ], type: EAV }) as REDCapEavRecord[];
                    config.records = config.records.concat(newRecs);
                }
            }

            /*
             * Prepare to import into Leaf
             */
            console.log(config);
            await loadREDCapImportData(config);

            for (const field of config.metadata) {
                const count = await calculateREDCapFieldCount(field.field_name);

                console.log(field.field_name, count);
            }
            

            console.log(config);

        } catch (err) {
            console.log(err);
            dispatch(setImportError());
        }
    };
};


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

const initializeREDCapImportConfiguration = (): REDCapImportConfiguration => {
    return  {
        forms: [],
        metadata: [],
        mrnField: 'mrn',
        mrns: [],
        projectInfo: {
            creation_time: '',
            display_today_now_button: 0,
            has_repeating_instruments_or_events: 0,
            is_longitudinal: 0,
            project_id: 0,
            project_title: '',
            purpose: 0,
            randomization_enabled: 0,
            record_autonumbering_enabled: 0,
            scheduling_enabled: 0,
            surveys_enabled: 0
        },
        recordField: '',
        records: [],
        users: []
    };
};