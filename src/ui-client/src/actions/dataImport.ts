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

            /*
             * Get metadata.
             */
            // dispatch(setImportProgress(2, 'Loading metadata'));
            const metadata = await conn.importMetadata();

            console.log(metadata);

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