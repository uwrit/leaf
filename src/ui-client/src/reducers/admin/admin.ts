/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import AdminState, { AdminPanelLoadState, AdminPanelConceptEditorPane } from "../../models/state/AdminState";
import {
    SET_ADMIN_CONCEPT,
    SET_ADMIN_PANEL_CURRENT_USER_CONCEPT,
    AdminConceptAction,
    SET_ADMIN_PANEL_LOAD_STATE,
    SET_ADMIN_PANEL_CONCEPT_LOAD_STATE,
    SET_ADMIN_CONCEPT_EXAMPLE_SQL,
    SET_ADMIN_PANEL_CONCEPT_EDITOR_PANE
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
import { setAdminConcept, setAdminPanelConceptLoadState, generateDummyPanel, setExampleSql, deleteAdminConceptFromCache, setAdminPanelConceptEditorPane, setAdminCurrentUserConcept } from './concept';
import { SET_ADMIN_SQL_CONFIGURATION, AdminConfigurationAction } from "../../actions/admin/configuration";
import { setAdminSqlConfiguration } from "./configuration";
import { REMOVE_CONCEPT } from "../../actions/concepts";
import { setAdminConceptSqlSets, deleteAdminConceptSqlSet, setAdminUneditedConceptSqlSet, undoAdminConceptSqlSetChanges, setAdminConceptSqlSetUnchanged, syncAdminConceptSqlSetUnsavedWithSaved } from "./sqlSet";
import { setAdminConceptSpecializationGroups, removeAdminConceptSpecializationGroup, syncAdminConceptSpecializationGroupUnsavedWithSaved } from "./specializationGroup";
import { setAdminConceptSpecialization, removeAdminConceptSpecialization, syncAdminConceptSpecializationUnsavedWithSaved } from "./specialization";

export const defaultAdminState = (): AdminState => {
    return {
        activeTab: AdminPanelConceptEditorPane.MAIN,
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

type AdminAction = AdminConceptAction | AdminConfigurationAction | AdminSqlSetAction | AdminSpecializationGroupAction | AdminSpecializationAction;

export const admin = (state: AdminState = defaultAdminState(), action: AdminAction): AdminState => {
    switch (action.type) {

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

        default:
            return state;
    }
};