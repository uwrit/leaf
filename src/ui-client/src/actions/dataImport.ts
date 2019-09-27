/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Action, Dispatch } from 'redux';
import { AppState } from '../models/state/AppState';
import { ImportOptionsDTO, ImportProgress, REDCapImportState } from '../models/state/Import';
import { REDCapHttpConnector } from '../services/redcapApi';
import { REDCapEavRecord } from '../models/redcapApi/Record';
import { REDCapRecordFormat, REDCapRecordExportConfiguration } from '../models/redcapApi/RecordExportConfiguration';
import { REDCapImportConfiguration } from '../models/redcapApi/ImportConfiguration';
import { loadREDCapImportData, calculateREDCapFieldCount } from '../services/dataImport';
import { InformationModalState, NotificationStates } from '../models/state/GeneralUiState';
import { setNoClickModalState, showInfoModal } from './generalUi';

export const IMPORT_COMPLETE = 'IMPORT_COMPLETE'
export const IMPORT_ERROR = 'IMPORT_ERROR';
export const IMPORT_CLEAR_ERROR_OR_COMPLETE = 'IMPORT_CLEAR_ERROR_OR_COMPLETE';
export const IMPORT_SET_OPTIONS = 'IMPORT_SET_OPTIONS';
export const IMPORT_SET_PROGRESS = 'IMPORT_SET_PROGRESS';
export const IMPORT_TOGGLE_REDCAP_MODAL = 'IMPORT_TOGGLE_REDCAP_MODAL';
export const IMPORT_SET_REDCAP_CONFIG = 'IMPORT_SET_REDCAP_CONFIG';
export const IMPORT_SET_REDCAP_MRN_FIELD = 'IMPORT_SET_REDCAP_MRN_FIELD';
export const IMPORT_SET_REDCAP_API_TOKEN = 'IMPORT_SET_REDCAP_API_TOKEN';
export const IMPORT_SET_REDCAP_ROW_COUNT = 'IMPORT_SET_REDCAP_ROW_COUNT';
export const IMPORT_SET_REDCAP_PATIENT_COUNT = 'IMPORT_SET_REDCAP_ROW_COUNT';
export const IMPORT_SET_REDCAP_UNMATCHED = 'IMPORT_SET_REDCAP_UNMATCHED';
export const IMPORT_TOGGLE_MRN_MODAL = 'IMPORT_TOGGLE_MRN_MODAL';

export interface ImportAction {
    count?: number;
    error?: string;
    field?: string;
    importOptions?: ImportOptionsDTO;
    loaded?: boolean;
    progress?: ImportProgress;
    rcConfig?: REDCapImportConfiguration;
    token?: string;
    type: string;
    unmatched?: string[];
}

// Asynchronous
/*
 * Load metadata from a REDCap instance.
 */
export const importMetadataFromREDCap = () => {
    return async (dispatch: any, getState: () => AppState) => {
        try {
            const state = getState();
            const { apiToken, apiURI } = state.dataImport.redCap;
            const conn = new REDCapHttpConnector(apiToken, apiURI);

            /* 
             * Try API token.
             */
            dispatch(setNoClickModalState({ message: 'Phoning a friend ', state: NotificationStates.Working }));
            const config = initializeREDCapImportConfiguration();
            config.projectInfo = await conn.getProjectInfo();
            config.metadata = await conn.getMetadata();

            /* 
             * Find first field with 'mrn' in the name (if any) and set the import configuration state.
             */
            const mrnField = config.metadata.find(f => f.field_name.indexOf('mrn') > -1);
            dispatch(setImportRedcapConfiguration(config));
            dispatch(setImportRedcapMrnField(mrnField ? mrnField.field_name : ''));
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));

        } catch (err) {
            const info: InformationModalState = {
                body: "Whoops, that doesn't seem to be a valid REDCap Project token. Check that the token is correct and that you have access to the REDCap API.",
                header: "Invalid REDCap Project Token",
                show: true
            };
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            dispatch(showInfoModal(info));
        }
    }
};

/*
 * Import project rows from REDCap.
 */
const importRecordsFromREDCap = async (dispatch: any, config: REDCapImportConfiguration, conn: REDCapHttpConnector) => {
    const { EAV } = REDCapRecordFormat;
    let records: REDCapEavRecord[] = [];

    /*
     * If Classic project.
     */
    if (!config.projectInfo.is_longitudinal) {
        for (const form of config.forms) {
            records = await importFormRecordsFromREDCap(dispatch, { forms: [ form.instrument_name ], type: EAV }, conn, records);
        }
    }

    /*
     * Else if Longitudinal project.
     */
    else {
        config.eventMappings = await conn.getEventMappings();
        const nonLongForms = config.forms.filter(f => config.eventMappings!.findIndex(e => e.form === f.instrument_name) === -1);

        for (const form of nonLongForms) {
            records = await importFormRecordsFromREDCap(dispatch, { forms: [ form.instrument_name ], type: EAV }, conn, records);
        }

        for (const e of config.eventMappings) {
            records = await importFormRecordsFromREDCap(dispatch, { events: [ e.unique_event_name ], forms: [ e.form ], type: EAV }, conn, records);
        }
    }
    return records;
};

/*
 * Import records from a given REDCap form.
 */
const importFormRecordsFromREDCap = async (dispatch: any, config: REDCapRecordExportConfiguration, conn: REDCapHttpConnector, records: REDCapEavRecord[]) => {
    const form = config.forms![0];

    if (!config.events) {
        dispatch(setImportProgress(10, `Loading form "${form}"`));
    } else {
        dispatch(setImportProgress(10, `Loading event "${config.events![0]}", form "${form}"`));
    }

    const newRecs = await conn.getRecords(config) as REDCapEavRecord[];
    records = records.concat(newRecs);
    dispatch(setImportRedcapRowCount(records.length));
    return records;
};

/*
 * Import results from a REDCap instance.
 */
export const importREDCapProjectData = () => {
    return async (dispatch: any, getState: () => AppState) => {
        startTime = new Date().getTime();
        try {
            /*
             * Initialize params.
             */
            
            // dispatch(setImportProgress(1, 'Preparing import'));
            const state = getState();
            const redCap = state.dataImport.redCap;
            const { Flat } = REDCapRecordFormat;
            const conn = new REDCapHttpConnector(redCap.apiToken, redCap.apiURI!);
            const config = redCap.config!;

            /*
             * Get project info.
             */
            config.forms = await conn.getForms();
            config.users = await conn.getUsers();
            config.recordField = config.metadata[0].field_name;
            config.mrns = await conn.getRecords({ fields: [ config.recordField, config.mrnField ], type: Flat });

            /* 
             * Get records.
             */
            config.records = await importRecordsFromREDCap(dispatch, config, conn);

            /*
             * Prepare to import into Leaf
             */
            const concepts = await loadREDCapImportData(config);
            
            concepts.forEach( async concept => {
                dispatch(setImportProgress(10, `Calculating patients counts for "${concept.uiDisplayName}"`));
                concept.uiDisplayPatientCount = await calculateREDCapFieldCount(concept);
            });

            // sanity check
            console.log([ ...concepts.values() ].map(c => [ c.uiDisplayName, c.uiDisplayPatientCount ]));

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

export const setImportRedcapConfiguration = (rcConfig: REDCapImportConfiguration | undefined): ImportAction => {
    return {
        rcConfig,
        type: IMPORT_SET_REDCAP_CONFIG
    };
};

export const setImportRedcapMrnField = (field: string): ImportAction => {
    return {
        field,
        type: IMPORT_SET_REDCAP_MRN_FIELD
    };
};

export const setImportRedcapApiToken = (token: string): ImportAction => {
    return {
        token,
        type: IMPORT_SET_REDCAP_API_TOKEN
    };
};

export const setImportRedcapRowCount = (count: number): ImportAction => {
    return {
        count,
        type: IMPORT_SET_REDCAP_ROW_COUNT
    };
};

export const setImportRedcapPatientCount = (count: number): ImportAction => {
    return {
        count,
        type: IMPORT_SET_REDCAP_PATIENT_COUNT
    };
};

export const setImportRedcapUnmatched = (count: number): ImportAction => {
    return {
        count,
        type: IMPORT_SET_REDCAP_UNMATCHED
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