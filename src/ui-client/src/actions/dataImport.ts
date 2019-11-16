/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../models/state/AppState';
import { ImportOptionsDTO, ImportProgress, REDCapImportCompletionSummary } from '../models/state/Import';
import { REDCapHttpConnector } from '../services/redcapApi';
import { REDCapEavRecord } from '../models/redcapApi/Record';
import { REDCapRecordFormat, REDCapRecordExportConfiguration } from '../models/redcapApi/RecordExportConfiguration';
import { REDCapImportConfiguration, REDCapConcept } from '../models/redcapApi/ImportConfiguration';
import { loadREDCapImportData, calculateREDCapFieldCount, createMetadata, getREDCapImportRecords, upsertImportRecords, getMetdataBySourceId, deleteMetadata, clearRecords, clearUnmappedRecords, updateMetadata } from '../services/dataImport';
import { InformationModalState, NotificationStates, ConfirmationModalState } from '../models/state/GeneralUiState';
import { setNoClickModalState, showInfoModal, showConfirmationModal } from './generalUi';
import { ImportMetadata, ImportType, REDCapImportStructure } from '../models/dataImport/ImportMetadata';
import { UserContext } from '../models/Auth';
import { ConstraintType, Constraint } from '../models/admin/Concept';
import { deleteAllExtensionConcepts, setExtensionRootConcepts } from './concepts';
import { getExtensionRootConcepts } from '../services/queryApi';

export const IMPORT_SET_METADATA = 'IMPORT_SET_METADATA';
export const IMPORT_SET_LOADED = 'IMPORT_SET_LOADED';
export const IMPORT_DELETE_METADATA = 'IMPORT_DELETE_METADATA';
export const IMPORT_ERROR = 'IMPORT_ERROR';
export const IMPORT_CLEAR_ERROR_OR_COMPLETE = 'IMPORT_CLEAR_ERROR_OR_COMPLETE';
export const IMPORT_SET_OPTIONS = 'IMPORT_SET_OPTIONS';
export const IMPORT_SET_PROGRESS = 'IMPORT_SET_PROGRESS';
export const IMPORT_TOGGLE_REDCAP_MODAL = 'IMPORT_TOGGLE_REDCAP_MODAL';
export const IMPORT_SET_REDCAP_CONFIG = 'IMPORT_SET_REDCAP_CONFIG';
export const IMPORT_SET_REDCAP_MRN_FIELD = 'IMPORT_SET_REDCAP_MRN_FIELD';
export const IMPORT_SET_REDCAP_API_TOKEN = 'IMPORT_SET_REDCAP_API_TOKEN';
export const IMPORT_SET_REDCAP_ROW_COUNT = 'IMPORT_SET_REDCAP_ROW_COUNT';
export const IMPORT_SET_REDCAP_PATIENT_COUNT = 'IMPORT_SET_REDCAP_PATIENT_COUNT';
export const IMPORT_SET_REDCAP_COMPLETE = 'IMPORT_SET_REDCAP_COMPLETE'
export const IMPORT_TOGGLE_MRN_MODAL = 'IMPORT_TOGGLE_MRN_MODAL';

export interface ImportAction {
    count?: number;
    error?: string;
    field?: string;
    importOptions?: ImportOptionsDTO;
    loaded?: boolean;
    meta?: ImportMetadata[];
    progress?: ImportProgress;
    rcConfig?: REDCapImportConfiguration;
    summary?: REDCapImportCompletionSummary;
    token?: string;
    type: string;
    unmapped?: string[];
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
            dispatch(setNoClickModalState({ message: 'Phoning a friend', state: NotificationStates.Working }));
            const config = initializeREDCapImportConfiguration();
            config.projectInfo = await conn.getProjectInfo();
            config.metadata = await conn.getMetadata();
            const complete = () => {

                /* 
                * Find first field with 'mrn' in the name (if any) and set the import configuration state.
                */
                const mrnField = config.metadata.find(f => f.field_name.indexOf('mrn') > -1);
                dispatch(setImportRedcapConfiguration(config));
                dispatch(setImportRedcapMrnField(mrnField ? mrnField.field_name : ''));
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            }

            /*
             * Check if project already imported
             */
            const prev = await getPreviouslyImportedRedCapProject(state, config);
            if (prev) {
                const confirm: ConfirmationModalState = {
                    body: `It looks like this project, "${config.projectInfo.project_title}", has already been imported into Leaf. Do you want to delete it now and import again?`,
                    header: 'Delete Previous REDCap Import',
                    onClickNo: () => null,
                    onClickYes: async () => {
                        dispatch(setNoClickModalState({ message: 'Deleting previous', state: NotificationStates.Working }));
                        await deleteMetadata(state, prev);
                        const imports = [ ...state.dataImport.imports.values() ].filter(d => d.id !== prev.id);
                        const extensionConcepts = await getExtensionRootConcepts(state.dataImport, imports, [ ...state.queries.saved.values() ]);
                        dispatch(deleteAllExtensionConcepts());
                        dispatch(setExtensionRootConcepts(extensionConcepts));
                        complete();
                    },
                    show: true,
                    noButtonText: `No`,
                    yesButtonText: `Yes, delete previous import`
                };
                dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                dispatch(showConfirmationModal(confirm));

            /*
             * If new, set the configuration and finish up.
             */
            } else {
                complete();
            }
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
 * Load metadata from a REDCap instance.
 */
export const getPreviouslyImportedRedCapProject = async (state: AppState, config: REDCapImportConfiguration): Promise<ImportMetadata | null> => {
    const sourceId = `urn:leaf:import:redcap:${config.projectInfo.project_id}`;
    try {
        const prev = await getMetdataBySourceId(state, sourceId);
        return prev;
    } catch (err) {
        return null;
    }
};

/*
 * Import project rows from REDCap.
 */
const importRecordsFromREDCap = async (dispatch: any, config: REDCapImportConfiguration, conn: REDCapHttpConnector) => {
    const { EAV } = REDCapRecordFormat;
    let total = 0;
    let i = 0;
    let done = 0.0;
    const increment = () => { i++; done = i / total * 100.0; }

    /*
     * If Classic project.
     */
    if (!config.projectInfo.is_longitudinal) {
        total = config.forms.length;
        for (const form of config.forms) {
            increment();
            config.records = await importFormRecordsFromREDCap(dispatch, conn, config, done, { forms: [ form.instrument_name ], type: EAV });
        }
    }

    /*
     * Else if Longitudinal project.
     */
    else {
        config.events = await conn.getEvents();
        config.eventMappings = await conn.getEventMappings();
        const nonLongForms = config.forms.filter(f => config.eventMappings!.findIndex(e => e.form === f.instrument_name) === -1);
        total = nonLongForms.length + config.eventMappings.length;

        for (const form of nonLongForms) {
            increment();
            config.records = await importFormRecordsFromREDCap(dispatch, conn, config, done, { forms: [ form.instrument_name ], type: EAV });
        }

        for (const e of config.eventMappings) {
            increment();
            config.records = await importFormRecordsFromREDCap(dispatch, conn, config, done, { events: [ e.unique_event_name ], forms: [ e.form ], type: EAV });
        }
    }
};

/*
 * Import records from a given REDCap form.
 */
const importFormRecordsFromREDCap = async (dispatch: any, conn: REDCapHttpConnector, config: REDCapImportConfiguration, done: number, request: REDCapRecordExportConfiguration,) => {
    const form = request.forms![0];
    const requestStart = new Date();
    let tryBatching = false;
    completed = (pcts.INITIAL * 100.0) + (done * pcts.RECORDS)

    if (!request.events) {
        dispatch(setImportProgress(completed, `Loading form "${form}"`));
    } else {
        dispatch(setImportProgress(completed, `Loading event "${request.events![0]}", form "${form}"`));
    }

    /* 
     * If project is small enough to import all fields, all patients from a form at once, do so.
     */
    const newRecs = await conn.getRecords(request) as REDCapEavRecord[];
    const elapsed = (new Date().getTime() - requestStart.getTime()) / 1000;

    if (elapsed >= 10 && newRecs.length === 0) {
        tryBatching = true;
    } else {
        config.records = config.records.concat(newRecs);
        dispatch(setImportRedcapRowCount(config.records.length));
    }

    /* 
     * Else request the data by batches of patients.
     */
    if (tryBatching) {
        const totalRecords = config.mrns.length;
        const batchSize = 100;
        let startIdx = 0;

        while (startIdx <= totalRecords) {

            /*
             * Import current batch.
             */
            const endIdx = startIdx + batchSize;
            const batch = config.mrns.slice(startIdx, endIdx).map(m => m[config.recordField]);
            const newRecs = await conn.getRecords({ ...request, records: batch }) as REDCapEavRecord[];
            const display = `(${endIdx.toLocaleString()} of ${totalRecords.toLocaleString()})`;
            config.records = config.records.concat(newRecs);
            startIdx += batchSize;
            dispatch(setImportRedcapRowCount(config.records.length));

            if (!request.events) {
                dispatch(setImportProgress(completed, `Loading form "${form}" ${display}`));
            } else {
                dispatch(setImportProgress(completed, `Loading event "${request.events![0]}", form "${form}" ${display}`));
            }
        
        }
    }
    
    return config.records;
};

/*
 * Delete an imported project.
 */
export const deleteREDCapImport = (meta: ImportMetadata) => {
    return async (dispatch: any, getState: () => AppState) => {
        const state = getState();
        dispatch(setNoClickModalState({ message: 'Deleting project', state: NotificationStates.Working }));

        try {
            await deleteMetadata(state, meta);
            const imports = [ ...state.dataImport.imports.values() ].filter(d => d.id !== meta.id);
            const extensionConcepts = await getExtensionRootConcepts(state.dataImport, imports, [ ...state.queries.saved.values() ]);
            dispatch(deleteImportMetadata(meta));
            dispatch(deleteAllExtensionConcepts());
            dispatch(setExtensionRootConcepts(extensionConcepts));

            dispatch(setNoClickModalState({ message: 'Project Deleted', state: NotificationStates.Complete }));
        } catch (err) {
            console.log(err);
            const info: InformationModalState = {
                body: "Uh oh, something went wrong when attempting to delete your REDCap project. Please contact your Leaf administrator.",
                header: "Error Deleting REDCap Project",
                show: true
            };
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            dispatch(showInfoModal(info));
        }
    };
};

/*
 * Import results from a REDCap instance.
 */
export const importREDCapProjectData = () => {
    return async (dispatch: any, getState: () => AppState) => {

        dispatch(setImportProgress(1, 'Preparing import'));
        startTime = new Date().getTime();
        completed = pcts.INITIAL * 100;
        const state = getState();
        let meta: any = null;

        try {
            /*
             * Initialize params.
             */
            const redCap = state.dataImport.redCap;
            const { Flat } = REDCapRecordFormat;
            const conn = new REDCapHttpConnector(redCap.apiToken, redCap.apiURI!);
            const config = redCap.config!;

            /*
             * Get project info.
             */
            dispatch(setImportProgress(3, 'Loading form types'));
            config.forms = await conn.getForms();

            dispatch(setImportProgress(6, 'Loading project users'));
            config.users = await conn.getUsers();

            dispatch(setImportProgress(9, 'Loading patient mappings'));
            config.recordField = config.metadata[0].field_name;
            config.mrnField = redCap.mrnField!;
            config.mrns = await conn.getRecords({ fields: [ config.recordField, config.mrnField ], type: Flat });
            dispatch(setImportRedcapPatientCount(config.mrns.length));

            /* 
             * Get records.
             */
            await importRecordsFromREDCap(dispatch, config, conn);

            /*
             * Transform metadata into concepts.
             */
            dispatch(setImportProgress(completed, 'Generating Leaf Concepts'));
            await clearRecords();
            const concepts = await loadREDCapImportData(config);

            /*
             * Import the project metadata
             */
            dispatch(setImportProgress(completed, 'Analyzing REDCap project structure'));
            meta = deriveREDCapImportMetadataStructure(state.auth.userContext!, concepts, config, config.mrns.length);
            meta = await createMetadata(state, meta);

            /*
             * Post records to the server in batches.
             */
            const records = await getREDCapImportRecords(meta.id!);
            const totalRecords = records.length;
            let unmappedPatients: string[] = [];
            let startIdx = 0;
            while (startIdx <= totalRecords) {

                /*
                 * Import current batch.
                 */
                const endIdx = startIdx + redCap.batchSize;
                const batch = records.slice(startIdx, endIdx);
                const displayText = `Loading ${(endIdx < totalRecords ? endIdx : totalRecords).toLocaleString()} of ${totalRecords.toLocaleString()} records into Leaf`;
                dispatch(setImportProgress(completed, displayText));
                const result = await upsertImportRecords(state, meta, batch);
                unmappedPatients = [ ...new Set(unmappedPatients.concat(result.unmapped)) ];

                /*
                 * Increment current index and recalculate import progress.
                 */
                startIdx += redCap.batchSize;
                completed = Math.round(((pcts.INITIAL + pcts.RECORDS) + (endIdx / totalRecords * pcts.LOAD)) * 100);
            }

            /*
             * Delete any cached records for which the server wasn't
             * able to map an MRN to a patientId.
             */
            await clearUnmappedRecords(new Set(unmappedPatients));

            /*
             * Calculate the patient count for each new REDCap concept.
             */
            let i = 0;
            const len = concepts.length;
            const lenStr = len.toLocaleString();
            const increment = () => { i++; completed = Math.round(((1 - pcts.COUNTS) * 100.0) + ((i / len * 100.0) * pcts.COUNTS)); }
            
            for (const concept of concepts) {
                increment();
                dispatch(setImportProgress(completed, `Calculating patient counts (${i.toLocaleString()} of ${lenStr} concepts)`));
                concept.uiDisplayPatientCount = await calculateREDCapFieldCount(concept);
            };

            /*
             * Update metadata with final patient counts.
             */
            dispatch(setImportProgress(100, 'Finishing up'));
            (meta.structure as REDCapImportStructure).concepts = concepts;
            await updateMetadata(state, meta);

            /*
             * Update concept tree.
             */
            const imports = [ ...state.dataImport.imports.values() ].concat([ meta ]);
            const extensionConcepts = await getExtensionRootConcepts(state.dataImport, imports, [ ...state.queries.saved.values() ]);
            dispatch(deleteAllExtensionConcepts());
            dispatch(setExtensionRootConcepts(extensionConcepts));
            dispatch(setImportMetadata(meta));
            
            /*
             * Success, so wrap it up.
             */
            await clearRecords();
            dispatch(setImportRedcapComplete({ 
                importedPatients: config.mrns.length, 
                importedRows: records.length, 
                unmappedPatients, 
                users: config.users.map(u => u.username) 
            }));

        } catch (err) {
            console.log(err);
            dispatch(setImportError());
            clearRecords();
            if (meta && meta.id) {
                deleteImportMetadata(meta);
                deleteMetadata(state, meta);
            }
        }
    };
};

// Synchronous
export const setImportMetadata = (meta: ImportMetadata): ImportAction => {
    return {
        meta: [ meta ],
        type: IMPORT_SET_METADATA
    };
};

export const setImportsMetadata = (meta: ImportMetadata[]): ImportAction => {
    return {
        meta,
        type: IMPORT_SET_METADATA
    };
};

export const setImportsLoaded = (): ImportAction => {
    return {
        type: IMPORT_SET_LOADED
    };
};

export const deleteImportMetadata = (meta: ImportMetadata): ImportAction => {
    return {
        meta: [ meta ],
        type: IMPORT_DELETE_METADATA
    };
};

export const toggleImportRedcapModal = (): ImportAction => {
    return {
        type: IMPORT_TOGGLE_REDCAP_MODAL
    };
};

export const setImportRedcapConfiguration = (rcConfig: REDCapImportConfiguration | undefined = undefined): ImportAction => {
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

export const setImportRedcapComplete = (summary: REDCapImportCompletionSummary): ImportAction => {
    return {
        summary,
        type: IMPORT_SET_REDCAP_COMPLETE
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
 * Set proportion of total completion time each stage is weighted.
 */
const pcts = {
    INITIAL: 0.1,
    RECORDS: 0.2,
    LOAD: 0.3,
    COUNTS: 0.4
};
let completed = 0;

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

/*
 * Create a REDCap import config from scratch, which will be updated
 * as the import progresses.
 */
const initializeREDCapImportConfiguration = (): REDCapImportConfiguration => {
    return  {
        forms: [],
        metadata: [],
        mrnField: '',
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

/*
 * Create a REDCap import metadata structure, which will be stored as JSON
 * in the DB and loaded in the client on future startups.
 */
const deriveREDCapImportMetadataStructure = (user: UserContext, concepts: REDCapConcept[], config: REDCapImportConfiguration, patients: number): ImportMetadata => {
    const id = `urn:leaf:import:redcap:${config.projectInfo.project_id}`;
    const structure: REDCapImportStructure = {
        id,
        concepts,
        configuration: {
            eventMappings: config.eventMappings,
            events: config.events,
            forms: config.forms,
            mrnField: config.mrnField,
            projectInfo: config.projectInfo,
            recordField: config.recordField,
            users: config.users
        },
        patients
    };

    return {
        created: new Date(),
        constraints: createREDCapAccessUsers(user, config),
        sourceId: id,
        structure,
        type: ImportType.REDCapProject,
        updated: new Date()
    } 
};

/*
 * Configure the users who can access the project by checking REDCap,
 * then swapping their REDCap-based scope (ie, everything after the '@')
 * with the current scope of the importing user. The current user is
 * of course also added to the group.
 */
const createREDCapAccessUsers = (user: UserContext, config: REDCapImportConfiguration): Constraint[] => {
    const fullscope = `${user.scope}@${user.issuer}`;
    const importer = `${user.name}@${fullscope}`;
    const others = config.users
        .map(u => {
            let name = u.username;
            const atIdx = u.username.indexOf('@');
            if (atIdx > -1) {
                name = name.substring(0, atIdx);
            }
            return `${name}@${fullscope}`
        })

    return [ ...new Set([ ...others, ...[ importer ]]) ]
        .map(u => ({ constraintId: ConstraintType.User, constraintValue: u }));
};