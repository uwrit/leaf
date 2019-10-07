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
            apiToken: '',
            apiURI: '',
            batchSize: 1000,
            enabled: false,
            mrnField: '',
            patients: 0,
            rows: 0,
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
                isImporting: false
            });
        case IMPORT_SET_OPTIONS:
            return Object.assign({}, state, {
                mrn: { ...state.mrn },
                redCap: { ...state.redCap },
                ...action.importOptions,
                enabled: action.importOptions!.redCap || action.importOptions!.mrn.enabled
            });
        case IMPORT_SET_PROGRESS:
            return Object.assign({}, state, {
                isImporting: true,
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