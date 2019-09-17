/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import ImportState from '../models/state/Import';
import { IMPORT_COMPLETE, IMPORT_SET_OPTIONS, IMPORT_CLEAR_ERROR_OR_COMPLETE, IMPORT_SET_PROGRESS, IMPORT_ERROR, ImportAction } from '../actions/dataImport';

export function defaultImportState(): ImportState {
    return {
        enabled: false,
        isComplete: false,
        isErrored: false,
        isImporting: false,
        mrn: {
            enabled: false
        },
        progress: {
            completed: 0,
            estimatedSecondsRemaining: 0,
            text: ''
        },
        redCap: {
            apiURI: 'https://redcap.iths.org/api/',
            enabled: false
        }
    } 
}

export const dataImport = (state: ImportState = defaultImportState(), action: ImportAction): ImportState => {
    switch (action.type) {
        case IMPORT_COMPLETE:
            return Object.assign({}, state, {
                isComplete: true
            }); 
        case IMPORT_CLEAR_ERROR_OR_COMPLETE:
            return Object.assign({}, state, {
                isComplete: false,
                isErrored: false,
                isExporting: false
            });
        case IMPORT_SET_OPTIONS:
            return Object.assign({}, state, action.importOptions);
        case IMPORT_SET_PROGRESS:
            return Object.assign({}, state, {
                isExporting: true,
                progress: action.progress,
            });
        case IMPORT_ERROR:
            return Object.assign({}, state, {
                isErrored: true
            });
        default:
            return state;
    }
}