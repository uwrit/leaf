/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState, { AdminPanelLoadState, AdminPanelPane } from "../../models/state/AdminState";
import {
    SET_ADMIN_PANEL_PANE,
    SET_ADMIN_PANEL_LOAD_STATE,
    AdminPanelAction
} from '../../actions/admin/admin';
import {
    SET_ADMIN_CONCEPT,
    SET_ADMIN_PANEL_CURRENT_USER_CONCEPT,
    AdminConceptAction,
    SET_ADMIN_PANEL_CONCEPT_LOAD_STATE,
    SET_ADMIN_CONCEPT_EXAMPLE_SQL,
    CREATE_ADMIN_CONCEPT,
    REMOVE_UNSAVED_ADMIN_CONCEPT,
    RESET_ADMIN_CONCEPT_CACHE
} from '../../actions/admin/concept';
import {
    SET_ADMIN_SPECIALIZATIONS,
    REMOVE_ADMIN_SPECIALIZATION,
    AdminSpecializationAction,
    SYNC_ADMIN_SPECIALIZATION_UNSAVED_WITH_SAVED
} from '../../actions/admin/specialization';
import {
    SET_ADMIN_SPECIALIZATION_GROUPS,
    REMOVE_ADMIN_SPECIALIZATION_GROUP,
    AdminSpecializationGroupAction,
    SYNC_ADMIN_SPECIALIZATION_GROUP_UNSAVED_WITH_SAVED
} from '../../actions/admin/specializationGroup';
import {
    SET_ADMIN_SQL_SETS,
    REMOVE_ADMIN_SQL_SET,
    AdminSqlSetAction,
    SET_ADMIN_UNEDITED_SQL_SETS,
    UNDO_ADMIN_SQL_SET_CHANGES,
    SET_ADMIN_SQL_SETS_UNCHANGED,
    SYNC_ADMIN_SQL_SET_UNSAVED_WITH_SAVED
} from '../../actions/admin/sqlSet';
import { 
    SET_ADMIN_CONCEPT_EVENTS, 
    REMOVE_ADMIN_CONCEPT_EVENT, 
    UNDO_ADMIN_CONCEPT_EVENT_CHANGE, 
    SET_ADMIN_UNEDITED_CONCEPT_EVENT 
} from "../../actions/admin/conceptEvent";
import { 
    REMOVE_CONCEPT 
} from "../../actions/concepts";
import { 
    SET_ADMIN_PANEL_DATASET_LOAD_STATE, 
    SET_ADMIN_DATASET, 
    SET_ADMIN_DEMOGRAPHICS_DATASET, 
    SET_ADMIN_DATASET_SHAPE, 
    SET_ADMIN_DATASET_SQL 
} from "../../actions/admin/dataset";
import { 
    SET_ADMIN_DATASET_QUERY_CATEGORIES, 
    SET_ADMIN_UNEDITED_DATASET_QUERY_CATEGORY, 
    UNDO_ADMIN_DATASET_QUERY_CATEGORY_CHANGE, 
    REMOVE_ADMIN_DATASET_QUERY_CATEGORY 
} from "../../actions/admin/datasetQueryCategory";
import { 
    SET_ADMIN_NETWORK_IDENTITY, 
    SET_ADMIN_NETWORK_ENDPOINT, 
    SET_ADMIN_NETWORK_ENDPOINTS, 
    REVERT_ADMIN_NETWORK_CHANGES, 
    REMOVE_ADMIN_NETWORK_ENDPOINT,
    SET_ADMIN_NETWORK_CERT_MODAL,
    TOGGLE_ADMIN_NETWORK_CERT_MODAL_SHOWN
} from "../../actions/admin/networkAndIdentity";
import { 
    SET_ADMIN_SQL_CONFIGURATION, 
    AdminConfigurationAction 
} from "../../actions/admin/configuration";
import { setAdminConcept, setAdminPanelConceptLoadState, generateDummyPanel, setExampleSql, deleteAdminConceptFromCache, setAdminCurrentUserConcept, createAdminConcept, removeUnsavedAdminConcept, resetAdminConceptCache } from './concept';
import { setAdminSqlConfiguration } from "./configuration";
import { setAdminConceptSqlSets, deleteAdminConceptSqlSet, setAdminUneditedConceptSqlSet, undoAdminConceptSqlSetChanges, setAdminConceptSqlSetUnchanged, syncAdminConceptSqlSetUnsavedWithSaved } from "./sqlSet";
import { setAdminConceptSpecializationGroups, removeAdminConceptSpecializationGroup, syncAdminConceptSpecializationGroupUnsavedWithSaved } from "./specializationGroup";
import { setAdminConceptSpecialization, removeAdminConceptSpecialization, syncAdminConceptSpecializationUnsavedWithSaved } from "./specialization";
import { setAdminConceptEvents, removeAdminConceptEvent, undoAdminConceptEventChange, setAdminUneditedConceptEvent } from "./conceptEvent";
import { setAdminPanelDatasetLoadState, setAdminPanelCurrentDataset, setAdminPanelDemographicsDataset, setAdminPanelDatasetShape, setAdminPanelDatasetSql } from "./dataset";
import { setAdminDatasetQueryCategories, setAdminUneditedDatasetQueryCategory, undoAdminDatasetQueryCategoryChange, removeAdminDatasetQueryCategory } from "./datasetQueryCategory";
import { getDefaultIdentity, setAdminNetworkIdentity, setAdminNetworkEndpoint, setAdminNetworkEndpoints, removeAdminNetworkEndpoint, setAdminNetworkCertModalContent, setAdminNetworkCertModalShown, revertAdminNetworkChanges } from "./networkAndIdentity";
import { PatientListDatasetShape } from "../../models/patientList/Dataset";


export const defaultAdminState = (): AdminState => {
    return {
        activePane: AdminPanelPane.CONCEPTS,
        configuration: {
            sql: {
                alias: '',
                setPerson: '',
                setEncounter: '',
                fieldPersonId: '',
                fieldEncounterId: ''
            }
        },
        concepts: {
            changed: false,
            concepts: new Map(),
            examplePanel: generateDummyPanel(),
            exampleSql: '',
            state: AdminPanelLoadState.NOT_LOADED
        },
        conceptEvents: {
            changed: false,
            events: new Map()
        },
        datasets: {
            changed: false,
            expectedColumns: [],
            datasets: new Map(),
            demographicsDataset: { 
                id: '',
                constraints: [],
                isEncounterBased: false,
                name: 'Basic Demographics',
                shape: PatientListDatasetShape.Demographics,
                sqlStatement: '',
                tags: []
            },
            sqlColumns: new Set(),
            state: AdminPanelLoadState.NOT_LOADED
        },
        datasetQueryCategories: {
            changed: false,
            categories: new Map()
        },
        networkAndIdentity: {
            changed: false,
            endpoints: new Map(),
            identity: getDefaultIdentity(),
            modal: {
                show: false  
            },
            uneditedEndpoints: new Map(),
            uneditedIdentity: getDefaultIdentity()
        },
        panelFilters: {
            changed: false,
            panelFilters: new Map()
        },
        sqlSets: {
            changed: false,
            sets: new Map(),
            uneditedSets: new Map()
        },
        state: AdminPanelLoadState.NOT_LOADED
    };
};

const setAdminPanelLoadState = (state: AdminState, action: AdminConceptAction) => {
    return Object.assign({}, state, { 
        state: action.state
    });
};

const setAdminPanelPane = (state: AdminState, action: AdminPanelAction): AdminState => {
    return Object.assign({}, state, {
        activePane: action.pane
    });
}; 

type AdminAction = AdminPanelAction | AdminConceptAction | AdminConfigurationAction | AdminSqlSetAction | AdminSpecializationGroupAction | AdminSpecializationAction;

export const admin = (state: AdminState = defaultAdminState(), action: AdminAction): AdminState => {
    switch (action.type) {

        // UI
        case SET_ADMIN_PANEL_PANE:
            return setAdminPanelPane(state, action);

        // Concepts
        case SET_ADMIN_CONCEPT:
            return setAdminConcept(state, action);
        case SET_ADMIN_PANEL_CURRENT_USER_CONCEPT:
            return setAdminCurrentUserConcept(state, action);
        case SET_ADMIN_PANEL_LOAD_STATE:
            return setAdminPanelLoadState(state, action);
        case SET_ADMIN_PANEL_CONCEPT_LOAD_STATE:
            return setAdminPanelConceptLoadState(state, action);
        case SET_ADMIN_CONCEPT_EXAMPLE_SQL:
            return setExampleSql(state, action);
        case REMOVE_CONCEPT:
            return deleteAdminConceptFromCache(state, action);
        case CREATE_ADMIN_CONCEPT:
            return createAdminConcept(state, action);
        case REMOVE_UNSAVED_ADMIN_CONCEPT:
            return removeUnsavedAdminConcept(state, action);
        case RESET_ADMIN_CONCEPT_CACHE:
            return resetAdminConceptCache(state, action);

        // Configuration
        case SET_ADMIN_SQL_CONFIGURATION:
            return setAdminSqlConfiguration(state, action);

        // SQL Sets
        case SET_ADMIN_SQL_SETS:
            return setAdminConceptSqlSets(state, action);
        case REMOVE_ADMIN_SQL_SET:
            return deleteAdminConceptSqlSet(state, action);
        case SET_ADMIN_UNEDITED_SQL_SETS:
            return setAdminUneditedConceptSqlSet(state, action);
        case UNDO_ADMIN_SQL_SET_CHANGES:
            return undoAdminConceptSqlSetChanges(state, action);
        case SET_ADMIN_SQL_SETS_UNCHANGED:
            return setAdminConceptSqlSetUnchanged(state, action);
        case SYNC_ADMIN_SQL_SET_UNSAVED_WITH_SAVED:
            return syncAdminConceptSqlSetUnsavedWithSaved(state, action);

        // Specialization Groups
        case SET_ADMIN_SPECIALIZATION_GROUPS:
            return setAdminConceptSpecializationGroups(state, action);
        case REMOVE_ADMIN_SPECIALIZATION_GROUP:
            return removeAdminConceptSpecializationGroup(state, action);
        case SYNC_ADMIN_SPECIALIZATION_GROUP_UNSAVED_WITH_SAVED:
            return syncAdminConceptSpecializationGroupUnsavedWithSaved(state, action);

        // Specializations
        case SET_ADMIN_SPECIALIZATIONS:
            return setAdminConceptSpecialization(state, action);
        case REMOVE_ADMIN_SPECIALIZATION:
            return removeAdminConceptSpecialization(state, action);
        case SYNC_ADMIN_SPECIALIZATION_UNSAVED_WITH_SAVED:
            return syncAdminConceptSpecializationUnsavedWithSaved(state, action);

        // Concept Events
        case SET_ADMIN_CONCEPT_EVENTS:
            return setAdminConceptEvents(state, action);
        case SET_ADMIN_UNEDITED_CONCEPT_EVENT:
            return setAdminUneditedConceptEvent(state, action);
        case REMOVE_ADMIN_CONCEPT_EVENT:
            return removeAdminConceptEvent(state, action);
        case UNDO_ADMIN_CONCEPT_EVENT_CHANGE:
            return undoAdminConceptEventChange(state, action);

        // Datasets
        case SET_ADMIN_PANEL_DATASET_LOAD_STATE:
            return setAdminPanelDatasetLoadState(state, action);
        case SET_ADMIN_DATASET:
            return setAdminPanelCurrentDataset(state, action);
        case SET_ADMIN_DEMOGRAPHICS_DATASET:
            return setAdminPanelDemographicsDataset(state, action);
        case SET_ADMIN_DATASET_SHAPE:
            return setAdminPanelDatasetShape(state, action);
        case SET_ADMIN_DATASET_SQL:
            return setAdminPanelDatasetSql(state, action);

        // Dataset Query Categories
        case SET_ADMIN_DATASET_QUERY_CATEGORIES:
            return setAdminDatasetQueryCategories(state, action);
        case SET_ADMIN_UNEDITED_DATASET_QUERY_CATEGORY:
            return setAdminUneditedDatasetQueryCategory(state, action);
        case UNDO_ADMIN_DATASET_QUERY_CATEGORY_CHANGE:
            return undoAdminDatasetQueryCategoryChange(state, action);
        case REMOVE_ADMIN_DATASET_QUERY_CATEGORY:
            return removeAdminDatasetQueryCategory(state, action);

        // Network Identity & Endpoints
        case SET_ADMIN_NETWORK_IDENTITY:
            return setAdminNetworkIdentity(state, action);
        case SET_ADMIN_NETWORK_ENDPOINT:
            return setAdminNetworkEndpoint(state, action);
        case SET_ADMIN_NETWORK_ENDPOINTS:
            return setAdminNetworkEndpoints(state, action);
        case REMOVE_ADMIN_NETWORK_ENDPOINT:
            return removeAdminNetworkEndpoint(state, action);
        case REVERT_ADMIN_NETWORK_CHANGES:
            return revertAdminNetworkChanges(state, action);
        case SET_ADMIN_NETWORK_CERT_MODAL:
            return setAdminNetworkCertModalContent(state, action);
        case TOGGLE_ADMIN_NETWORK_CERT_MODAL_SHOWN:
            return setAdminNetworkCertModalShown(state, action);

        default:
            return state;
    }
};