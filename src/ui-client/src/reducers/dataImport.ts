/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import ImportState from '../models/state/Import';
import { 
    IMPORT_COMPLETE, 
    IMPORT_SET_OPTIONS, 
    IMPORT_CLEAR_ERROR_OR_COMPLETE, 
    IMPORT_SET_PROGRESS, 
    IMPORT_ERROR, 
    ImportAction, 
    IMPORT_SET_REDCAP_API_TOKEN, 
    IMPORT_SET_REDCAP_MRN_FIELD, 
    IMPORT_SET_REDCAP_UNMATCHED, 
    IMPORT_SET_REDCAP_ROW_COUNT, 
    IMPORT_SET_REDCAP_PATIENT_COUNT, 
    IMPORT_SET_REDCAP_CONFIG 
} from '../actions/dataImport';

export function defaultImportState(): ImportState {
    return {
        enabled: false,
        isComplete: false,
        isErrored: false,
        isImporting: true,
        mrn: {
            enabled: false
        },
        progress: {
            completed: 22,
            estimatedSecondsRemaining: 41,
            text: 'Loading "pat_name_formatted"'
        },
        redCap: {
            apiToken: '',
            apiURI: 'https://rcdev.iths.org/api/',
            enabled: false,
            mrnField: '',
            patients: 1231,
            rows: 101241,
            unmatchedPatients: []
        }
    } 
}

export const dataImport = (state: ImportState = defaultImportState(), action: ImportAction): ImportState => {
    switch (action.type) {

        /* 
         * General
         */
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
        
        /* 
         * REDCap
         */
        case IMPORT_SET_REDCAP_CONFIG:
            return Object.assign({}, state, { 
                redCap: {
                    ...state.redCap,
                    config: action.rcConfig
                }
            });

        case IMPORT_SET_REDCAP_API_TOKEN:
            return Object.assign({}, state, { 
                redCap: {
                    ...state.redCap,
                    apiToken: action.token
                }
            });

        case IMPORT_SET_REDCAP_MRN_FIELD:
            return Object.assign({}, state, { 
                redCap: {
                    ...state.redCap,
                    mrnField: action.field
                }
            });

        case IMPORT_SET_REDCAP_UNMATCHED:
            return Object.assign({}, state, { 
                redCap: {
                    ...state.redCap,
                    unmatchedPatients: action.unmatched
                }
            });

        case IMPORT_SET_REDCAP_ROW_COUNT:
            return Object.assign({}, state, { 
                redCap: {
                    ...state.redCap,
                    rows: action.count
                }
            });

        case IMPORT_SET_REDCAP_PATIENT_COUNT:
            return Object.assign({}, state, { 
                redCap: {
                    ...state.redCap,
                    patients: action.count
                }
            });

        default:
            return state;
    }
}