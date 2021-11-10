/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { EXPORT_CLEAR_ERROR_OR_COMPLETE, EXPORT_REDCAP_COMPLETE, EXPORT_COMPLETE, EXPORT_ERROR, EXPORT_SET_OPTIONS, EXPORT_SET_PROGRESS, ExportAction, } from '../actions/dataExport';
import ExportState from '../models/state/Export';

export function defaultExportState(): ExportState {
    return {
        enabled: false,
        isComplete: false,
        isErrored: false,
        isExporting: false,
        progress: {
            completed: 0,
            estimatedSecondsRemaining: 0,
            text: ''
        },
        csv: {
            enabled: false
        },
        redCap: {
            enabled: false
        }
    } 
}

export const dataExport = (state: ExportState = defaultExportState(), action: ExportAction): ExportState => {
    switch (action.type) {
        case EXPORT_COMPLETE:
            return Object.assign({}, state, {
                isComplete: true
            }); 
        case EXPORT_REDCAP_COMPLETE:
            return Object.assign({}, state, {
                isComplete: true,
                redCap: {
                    ...state.redCap,
                    url: action.url!
                }
            }); 
        case EXPORT_CLEAR_ERROR_OR_COMPLETE:
            return Object.assign({}, state, {
                isComplete: false,
                isErrored: false,
                isExporting: false
            });
        case EXPORT_SET_OPTIONS:
            return Object.assign({}, state, {
                enabled: (action.exportOptions!.redCap.enabled || action.exportOptions!.csv.enabled),
                csv: action.exportOptions!.csv,
                redCap: action.exportOptions!.redCap
            });
        case EXPORT_SET_PROGRESS:
            return Object.assign({}, state, {
                isExporting: true,
                progress: action.progress,
            });
        case EXPORT_ERROR:
            return Object.assign({}, state, {
                isErrored: true
            });
        default:
            return state;
    }
}