/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { SavedQuery, SavedQueryRef, Query, QueryDependent } from '../models/Query';
import { Dispatch } from 'redux';
import { AppState } from '../models/state/AppState';
import { panelToDto } from '../models/panel/Panel';
import { saveQueryHomeNode, saveQueryFedNode, deleteSavedQuery, getExtensionRootConcepts, loadSavedQuery, hasRecursiveDependency, deriveSavedQuery } from '../services/queryApi';
import { PanelFilter } from '../models/panel/PanelFilter';
import { setNoClickModalState, showInfoModal, toggleSaveQueryPane, hideMyLeafModal, showConfirmationModal, setRoute } from './generalUi';
import { NotificationStates, InformationModalState, ConfirmationModalState, Routes } from '../models/state/GeneralUiState';
import { NetworkIdentity } from '../models/NetworkResponder';
import { mergeExtensionConcepts } from './concepts';
import { ConceptExtensionInitializer } from '../models/concept/Concept';
import { resetPanels } from './panels';
import { setPanelFilterActiveStates } from './panelFilter';

export const REQUEST_SAVE_QUERY = 'REQUEST_SAVE_QUERY';
export const FINISH_SAVE_QUERY = 'FINISH_SAVE_QUERY';
export const ERROR_SAVE_QUERY = 'ERROR_SAVE_QUERY';
export const OPEN_SAVED_QUERY = 'OPEN_SAVED_QUERY';
export const REMOVE_SAVED_QUERIES = 'REMOVE_SAVED_QUERIES';
export const ADD_SAVED_QUERIES = 'ADD_SAVED_QUERIES';
export const SET_CURRENT_SAVED_QUERY = 'SET_CURRENT_SAVED_QUERY';
export const SET_RUN_AFTER_SAVE = 'SET_RUN_AFTER_SAVE';

export interface SaveQueryAction {
    query?: Query;
    queries?: SavedQueryRef[];
    error?: string;
    runAfterSave?: any;
    updateSavedChangeId?: boolean;
    type: string;
}

// Asynchronous
/*
 * Load a saved query definition from home node, then 
 * deserialize and request each dependent concept or embedded query.
 */
export const getSavedQuery = (ref: SavedQueryRef) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        const state = getState();
        if (state.queries.current.id && state.queries.current.id === ref.id) { return; }

        try {
            dispatch(setNoClickModalState({ message: "Loading Query", state: NotificationStates.Working }));
            const saved = await loadSavedQuery(ref.universalId, state);

            /* 
             * Update UI with the new query.
             */
            dispatch(setNoClickModalState({ message: "Query Loaded", state: NotificationStates.Complete }));
            dispatch(setCurrentQuery(saved, true));
            dispatch(addSavedQuery(saved));
            dispatch(openSavedQuery(saved));
            dispatch(setPanelFilterActiveStates(saved.panelFilters));
            dispatch(hideMyLeafModal());
        }
        catch (err) {
            const info: InformationModalState = {
                body: "Uh oh, something went wrong when attempting to load your query. Please contact your Leaf administrator.",
                header: "Error Loading Query",
                show: true
            };
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            dispatch(showInfoModal(info));
        }
    };
};

/*
 * Save a new or existing query. This is first 
 * saved on home node, which returns a universalId
 * which is then used for saving on network nodes. The 
 * query also becomes a concept on the tree.
 */
export const requestQuerySave = () => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        try {
            let state = getState();
            const { runAfterSave, current } = state.queries;
            const panels = state.panels.map(p => panelToDto(p));
            const panelFilters = state.panelFilters.filter((pf: PanelFilter) => pf.isActive);

            dispatch(setNoClickModalState({ message: "Saving Query", state: NotificationStates.Working }));

            /*
             * Check for recursion errors.
             */
            if (state.queries.current.id) {
                const recursiveDependancy = await hasRecursiveDependency(state);
                if (recursiveDependancy) {
                    const info: InformationModalState = {
                        body: `It looks like you've added "${recursiveDependancy}", which is itself a saved query that depends on ` +
                              `the current query, "${current.name}". Please remove "${recursiveDependancy}" and try again.`,
                        header: "Recursive query error",
                        show: true
                    };
                    dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                    dispatch(showInfoModal(info));
                    return;
                }
            }

            /*
             * Save to home node.
             */
            const response = await saveQueryHomeNode(getState(), panels, panelFilters);
            const saved = deriveSavedQuery(state, response.data);

            /*
             * Update current query in UI to this.
             */
            dispatch(setCurrentQuery(saved, true));
            dispatch(addSavedQuery(saved));

            /*
             * Regenerate extension concept tree
             * with the new query and possible category
             * as concepts.
             */
            state = getState();
            const savedQueries = [ ...state.queries.saved.values() ];
            const imports: any[] = []; // TODO: fix this
            // const newQueryConcepts = await getExtensionConcepts(imports, savedQueries) as ConceptExtensionInitializer;
            // dispatch(mergeExtensionConcepts(newQueryConcepts.concepts));

            /*
             * Save to any network responder nodes.
             */
            const responders: NetworkIdentity[] = [];
            state.responders.forEach((nr: NetworkIdentity) => { if (nr.enabled && !nr.isHomeNode) { responders.push(nr); } });
            await Promise.all(responders.map((nr: NetworkIdentity) => { 
                return new Promise( async(resolve, reject) => {
                    const queryId = state.cohort.networkCohorts.get(nr.id)!.count.queryId;
                    saveQueryFedNode(getState(), nr, panels, panelFilters, queryId, saved.universalId!).then(
                        response => resolve(),
                        error => resolve()
                    );
                });
            }));

            /*
             * Dismiss the modal and query pane. If transitioned simultaneously the pane may 
             * oddly push content left (pretty sure this is a webkit bug), so put on a delay.
             */
            dispatch(setNoClickModalState({ message: "Query Saved", state: NotificationStates.Complete }));
            setTimeout(() => dispatch(toggleSaveQueryPane()), 2000);

            /*
             * If there is any operation to run after 
             * saving (such as open a new query, etc.), do so.
             */
            if (runAfterSave) { 
                runAfterSave(); 
                dispatch(setRunAfterSave(null)); 
            }
        }
        catch (err) {
            console.log(err);
            const info: InformationModalState = {
                body: "Uh oh, something went wrong when attempting to save your query. Please contact your Leaf administrator.",
                header: "Error Saving Query",
                show: true
            };
            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
            dispatch(showInfoModal(info));
        }
    }
};

/*
 * Delete a saved cohort. This is first done on home node, followed by
 * network nodes. The 'force' param tells the server whether or not 
 * other saved queries which depend on the deleted query should be deleted 
 * as well (as otherwise they would't work anymore).
 */
export const deleteSavedQueryAndCohort = (query: SavedQueryRef, force: boolean = false, dependents: QueryDependent[] = []) => {
    return async (dispatch: Dispatch<any>, getState: () => AppState) => {
        try {
            let state = getState();
            const user = state.auth.userContext!.name;
            const homeNode = state.responders.get(0)!;

            dispatch(setNoClickModalState({ message: "Deleting Query", state: NotificationStates.Working }));

            /*
             * Initial query delete attempt.
             */
            deleteSavedQuery(state, homeNode, query, force)
                .then(
                    async (response) => {
                        
                        /*
                         * If successful on home node, delete this and 
                         * dependent queries from state.
                         */
                        const deleted = [ query ].concat(dependents.map((d) => state.queries.saved.get(d.universalId)!));
                        dispatch(removeSavedQueries(deleted));

                        /*
                         * If the query being deleted (or a dependent) happens 
                         * to be open right now, reset it.
                         */
                        if (state.queries.current.id && deleted.find((d) => d.id === state.queries.current.id)) {
                            dispatch(setCurrentQuery({ name: '', category: ''}, true));
                            dispatch(setRoute(Routes.FindPatients));
                            dispatch(resetPanels());
                        }

                        /*
                         * Update the concept tree.
                         */
                        state = getState();
                        const savedQueries = [ ...state.queries.saved.values() ];
                        const imports: any[] = []; // TODO: fix this
                        // const newQueryConcepts = await getExtensionConcepts(imports, savedQueries) as ConceptExtensionInitializer;
                        // dispatch(mergeExtensionConcepts(newQueryConcepts.concepts));

                        /*
                         * Delete from network responders.
                         */
                        const responders: NetworkIdentity[] = [];
                        state.responders.forEach((nr: NetworkIdentity) => { if (nr.enabled && !nr.isHomeNode) { responders.push(nr); } });
                        Promise.all(responders.map((nr: NetworkIdentity) => { 
                            return new Promise( async(resolve, reject) => {
                                deleteSavedQuery(state, nr, query, force)
                                    .then(response => resolve(), error => resolve());
                                });
                            })
                        ).then(() => dispatch(setNoClickModalState({ message: "Query Deleted", state: NotificationStates.Complete })));
                    },
                    error => {
                        /*
                         * Else the delete attempt was rejected. If a 409,
                         * then there are dependent queries which need to
                         * be addressed first and the error can be handled.
                         */
                        if (error.response.status !== 409 || force) {
                            console.log(error);
                            const info: InformationModalState = {
                                body: "Uh oh, something went wrong when attempting to delete your query. Please contact your Leaf administrator.",
                                header: "Error Deleting Query",
                                show: true
                            };
                            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                            dispatch(showInfoModal(info));
                            return;
                        }
                        const dependents = error.response.data.dependents as QueryDependent[];
                        const nonOwners = dependents.filter((d) => !d.owner.startsWith(user));

                        /*
                          If there are any dependent queries that are not owned
                         * by the current user, this query is not delete-able
                         * until the dependents owned by others are first deleted.
                         */
                        if (nonOwners.length) {
                            const ex = nonOwners[0];
                            const info: InformationModalState = {
                                body: nonOwners.length > 1
                                    ? `There are ${nonOwners.length} other queries, including "${ex.name}", owned by ${ex.owner},` + 
                                      `that depend on this query and therefore this cannot be deleted.`
                                    : `Another query, "${ex.name}", owned by ${ex.owner}, ` + 
                                      `depends on this query and therefore this cannot be deleted.`,
                                header: "Error Deleting Query",
                                show: true
                            };
                            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                            dispatch(showInfoModal(info));
                            return;
                        }

                        /*
                         * If the force flag is not set and there are no dependent
                         * queries not owned by the current user, give the user the 
                         * option to perform a cascading delete and remove both this
                         * and all dependent queries by setting the 'force' flag and retrying.
                         */
                        if (!force) {
                            const cnt = dependents.length;
                            const ex = dependents[0];
                            const confirm: ConfirmationModalState = {
                                body: cnt > 1
                                    ? `There are ${cnt} other saved queries that depend on this query, including "${ex.name}". Do you want to proceed? ` +
                                      `This will delete "${query.name}" and the ${cnt} other dependent queries.`
                                    : `Another saved query, "${ex.name}" depends on this query. Do you want to proceed? ` +
                                      `This will delete both "${query.name}" and "${ex.name}".`,
                                header: 'Delete Dependent Queries',
                                onClickNo: () => null,
                                onClickYes: () => { dispatch(deleteSavedQueryAndCohort(query, true, dependents)); },
                                show: true,
                                noButtonText: `No`,
                                yesButtonText: `Yes, delete all queries`
                            };
                            dispatch(setNoClickModalState({ state: NotificationStates.Hidden }));
                            dispatch(showConfirmationModal(confirm));
                            return;
                        }
                    }
                );
        }
        catch (err) {
            console.log(err);
        }
    }
};

// Synchronous
export const openSavedQuery = (query: SavedQuery): SaveQueryAction => {
    return {
        query,
        type: OPEN_SAVED_QUERY
    };
};

export const addSavedQuery = (query: SavedQuery): SaveQueryAction => {
    return {
        queries: [ query ],
        type: ADD_SAVED_QUERIES
    };
};

export const addSavedQueries = (queries: SavedQueryRef[]): SaveQueryAction => {
    return {
        queries,
        type: ADD_SAVED_QUERIES
    };
};

export const removeSavedQuery = (query: SavedQueryRef): SaveQueryAction => {
    return {
        queries: [ query ],
        type: REMOVE_SAVED_QUERIES
    };
};

export const removeSavedQueries = (queries: SavedQueryRef[]): SaveQueryAction => {
    return {
        queries,
        type: REMOVE_SAVED_QUERIES
    };
};

export const finishSaveQuery = (query: SavedQuery): SaveQueryAction => {
    return {
        query,
        type: FINISH_SAVE_QUERY
    };
};

export const errorSaveQuery = (error: string): SaveQueryAction => {
    return {
        error,
        type: FINISH_SAVE_QUERY
    };
};

export const setCurrentQuery = (query: Query, updateSavedChangeId: boolean = false): SaveQueryAction => {
    return {
        query,
        updateSavedChangeId,
        type: SET_CURRENT_SAVED_QUERY
    };
};

export const setRunAfterSave = (runAfterSave: any) => {
    return {
        runAfterSave,
        type: SET_RUN_AFTER_SAVE
    }
};

