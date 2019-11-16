/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import ImportState from '../models/state/Import';
import { 
    IMPORT_SET_REDCAP_COMPLETE, 
    IMPORT_SET_OPTIONS, 
    IMPORT_CLEAR_ERROR_OR_COMPLETE, 
    IMPORT_SET_PROGRESS, 
    IMPORT_ERROR, 
    ImportAction, 
    IMPORT_SET_REDCAP_API_TOKEN, 
    IMPORT_SET_REDCAP_MRN_FIELD,
    IMPORT_SET_REDCAP_ROW_COUNT, 
    IMPORT_SET_REDCAP_PATIENT_COUNT, 
    IMPORT_SET_REDCAP_CONFIG, 
    IMPORT_SET_METADATA,
    IMPORT_DELETE_METADATA,
    IMPORT_SET_LOADED
} from '../actions/dataImport';

export function defaultImportState(): ImportState {
    return {
        enabled: false,
        imports: new Map(),
        isComplete: false,
        isErrored: false,
        isImporting: false,
        loaded: false,
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
            summary: {
                importedPatients: 0,
                importedRows: 0,
                unmappedPatients: [],
                users: []
            }
        }
    } 
}

export const dataImport = (state: ImportState = defaultImportState(), action: ImportAction): ImportState => {
    switch (action.type) {

        /* 
         * General
         */
        case IMPORT_SET_LOADED:
            return Object.assign({}, state, { 
                loaded: true
            });

        case IMPORT_SET_METADATA:
            for (const meta of action.meta!) {
                state.imports.set(meta.id!, meta);
            }
            return Object.assign({}, state, { 
                imports: new Map(state.imports),
                loaded: true
            });

        case IMPORT_DELETE_METADATA:
            for (const meta of action.meta!) {
                state.imports.delete(meta.id!);
            }
            return Object.assign({}, state, { 
                imports: new Map(state.imports) 
            });

        case IMPORT_CLEAR_ERROR_OR_COMPLETE:
            return Object.assign({}, state, {
                isComplete: false,
                isErrored: false,
                isImporting: false,
                redCap: {
                    ...state.redCap,
                    patients: 0,
                    rows: 0,
                    summary: defaultImportState().redCap.summary
                }
            });
        case IMPORT_SET_OPTIONS:
            return Object.assign({}, state, {
                mrn: { ...state.mrn, ...action.importOptions!.mrn },
                redCap: { ...state.redCap, ...action.importOptions!.redCap },
                enabled: action.importOptions!.redCap.enabled
            });
        case IMPORT_SET_PROGRESS:
            return Object.assign({}, state, {
                isImporting: true,
                isErrored: false,
                isComplete: false,
                progress: action.progress,
            });
        case IMPORT_ERROR:
            return Object.assign({}, state, {
                isErrored: true,
                isComplete: false,
                isImporting: false,
                redCap: {
                    ...defaultImportState().redCap,
                    apiURI: state.redCap.apiURI,
                    batchSize: state.redCap.batchSize,
                    enabled: state.redCap.enabled
                }
            });
        
        /* 
         * REDCap
         */
        case IMPORT_SET_REDCAP_COMPLETE:
            return Object.assign({}, state, {
                isImporting: false,
                isErrored: false,
                isComplete: true,
                redCap: {
                    ...state.redCap,
                    apiToken: '',
                    summary: action.summary
                }
            });

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