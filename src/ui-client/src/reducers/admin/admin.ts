/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState, { AdminPanelLoadState, AdminPanelConceptEditorPane } from "../../models/state/AdminState";
import {
    SET_ADMIN_CONCEPT,
    SET_ADMIN_CONCEPT_ORIGINAL,
    AdminConceptAction,
    SET_ADMIN_PANEL_LOAD_STATE,
    SET_ADMIN_PANEL_CONCEPT_LOAD_STATE,
    SET_ADMIN_CONCEPT_EXAMPLE_SQL,
    REVERT_ADMIN_CONCEPT_TO_ORIGINAL,
    SET_ADMIN_PANEL_CONCEPT_EDITOR_PANE
} from '../../actions/admin/concept';
import {
    SET_ADMIN_SPECIALIZATIONS,
    REMOVE_ADMIN_SPECIALIZATION,
    SET_ADMIN_CURRENT_SPECIALIZATION,
    SET_ADMIN_UNEDITED_SPECIALIZATION,
    AdminSpecializationAction
} from '../../actions/admin/specialization';
import {
    SET_ADMIN_SPECIALIZATION_GROUPS,
    REMOVE_ADMIN_SPECIALIZATION_GROUP,
    AdminSpecializationGroupAction
} from '../../actions/admin/specializationGroup';
import {
    SET_ADMIN_SQL_SETS,
    REMOVE_ADMIN_SQL_SET,
    SET_ADMIN_CURRENT_SQL_SET,
    SET_ADMIN_UNEDITED_SQL_SET,
    SET_ADMIN_UNSAVED_SQL_SETS,
    UPSERT_ADMIN_QUEUED_API_EVENT,
    REMOVE_ADMIN_QUEUED_API_EVENT,
    AdminSqlSetAction
} from '../../actions/admin/sqlSet';
import { setAdminConcept, setAdminPanelConceptLoadState, generateDummyPanel, setExampleSql, revertAdminConceptToOriginal, deleteAdminConceptFromCache, setAdminPanelConceptEditorPane, setAdminUiConceptOriginal } from './concept';
import { SET_ADMIN_SQL_CONFIGURATION, AdminConfigurationAction } from "../../actions/admin/configuration";
import { setAdminSqlConfiguration } from "./configuration";
import { REMOVE_CONCEPT } from "../../actions/concepts";
import { setAdminConceptSqlSets, deleteAdminConceptSqlSet, setAdminCurrentConceptSqlSets, setAdminUneditedConceptSqlSet, setAdminUnsavedConceptSqlSets, upsertAdminQueuedApiEvent, removeAdminQueuedApiEvent } from "./sqlSet";
import { setAdminConceptSpecializationGroups, removeAdminConceptSpecializationGroup } from "./specializationGroup";
import { setAdminConceptSpecialization, removeAdminConceptSpecialization, setAdminCurrentConceptSpecialization, setAdminUneditedConceptSpecialization } from "./specialization";

export const defaultAdminState = (): AdminState => {
    return {
        activeTab: 1,
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
            pane: AdminPanelConceptEditorPane.MAIN,
            state: AdminPanelLoadState.NOT_LOADED
        },
        datasets: {

        },
        panelFilters: {
            changed: false,
            panelFilters: new Map()
        },
        sqlSets: {
            changed: false,
            sets: new Map(),
            unsavedSets: new Map(),
            updateQueue: []
        },
        specializationGroups: {
            specializationChanged: false,
            groupChanged: false
        },
        state: AdminPanelLoadState.NOT_LOADED
    };
};

const setAdminPanelLoadState = (state: AdminState, action: AdminConceptAction) => {
    return Object.assign({}, state, { 
        state: action.state
    });
};

type AdminAction = AdminConceptAction | AdminConfigurationAction | AdminSqlSetAction | AdminSpecializationGroupAction | AdminSpecializationAction;

export const admin = (state: AdminState = defaultAdminState(), action: AdminAction): AdminState => {
    switch (action.type) {

        // Concepts
        case SET_ADMIN_CONCEPT:
            return setAdminConcept(state, action);
        case SET_ADMIN_CONCEPT_ORIGINAL:
            return setAdminUiConceptOriginal(state, action);
        case SET_ADMIN_PANEL_LOAD_STATE:
            return setAdminPanelLoadState(state, action);
        case SET_ADMIN_PANEL_CONCEPT_LOAD_STATE:
            return setAdminPanelConceptLoadState(state, action);
        case SET_ADMIN_CONCEPT_EXAMPLE_SQL:
            return setExampleSql(state, action);
        case REVERT_ADMIN_CONCEPT_TO_ORIGINAL:
            return revertAdminConceptToOriginal(state, action);
        case REMOVE_CONCEPT:
            return deleteAdminConceptFromCache(state, action);
        case SET_ADMIN_PANEL_CONCEPT_EDITOR_PANE:
            return setAdminPanelConceptEditorPane(state, action);

        // Configuration
        case SET_ADMIN_SQL_CONFIGURATION:
            return setAdminSqlConfiguration(state, action);

        // SQL Sets
        case SET_ADMIN_SQL_SETS:
            return setAdminConceptSqlSets(state, action);
        case REMOVE_ADMIN_SQL_SET:
            return deleteAdminConceptSqlSet(state, action);
        case SET_ADMIN_CURRENT_SQL_SET:
            return setAdminCurrentConceptSqlSets(state, action);
        case SET_ADMIN_UNEDITED_SQL_SET:
            return setAdminUneditedConceptSqlSet(state, action);
        case SET_ADMIN_UNSAVED_SQL_SETS:
            return setAdminUnsavedConceptSqlSets(state, action);
        case UPSERT_ADMIN_QUEUED_API_EVENT:
            return upsertAdminQueuedApiEvent(state, action);
        case REMOVE_ADMIN_QUEUED_API_EVENT:
            return removeAdminQueuedApiEvent(state, action);

        // Specialization Groups
        case SET_ADMIN_SPECIALIZATION_GROUPS:
            return setAdminConceptSpecializationGroups(state, action);
        case REMOVE_ADMIN_SPECIALIZATION_GROUP:
            return removeAdminConceptSpecializationGroup(state, action);

        // Specializations
        case SET_ADMIN_SPECIALIZATIONS:
            return setAdminConceptSpecialization(state, action);
        case REMOVE_ADMIN_SPECIALIZATION:
            return removeAdminConceptSpecialization(state, action);
        case SET_ADMIN_CURRENT_SPECIALIZATION:
            return setAdminCurrentConceptSpecialization(state, action);
        case SET_ADMIN_UNEDITED_SPECIALIZATION:
            return setAdminUneditedConceptSpecialization(state, action);

        default:
            return state;
    }
};