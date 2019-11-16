/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../models/state/AppState';
import { HttpFactory } from './HttpFactory';
import { SavedQueryRef, SavedQuery, SavedQueryRefDTO, SavedQueryDefinitionDTO, QuerySaveResponseDTO } from '../models/Query';
import ExtensionConceptsWebWorker from '../providers/extensionConcepts/extensionConceptsWebWorker';
import { PanelDTO, Panel } from '../models/panel/Panel';
import { PanelFilter } from '../models/panel/PanelFilter';
import { NetworkIdentity } from '../models/NetworkResponder';
import { ResourceRef, Concept } from '../models/concept/Concept';
import { fetchConcept } from '../services/conceptApi';
import { SubPanel } from '../models/panel/SubPanel';
import { PreflightCheckDTO } from '../models/PatientCountDTO';
import { getEmbeddedQueries, isNonstandard } from '../utils/panelUtils';
import { ImportMetadata } from '../models/dataImport/ImportMetadata';
import moment from 'moment';
import { setConcept } from '../actions/concepts';
import ImportState from '../models/state/Import';

const worker = new ExtensionConceptsWebWorker();

/*
 * Requests all Saved Queries available to the user. Note
 * that these are pointers to queries (i.e., they contain the UniversaliId),
 * but not the logic that the queries are actually composed of (i.e., panels, Concepts, etc.)
 */
export const getSavedQueries = async (state: AppState): Promise<SavedQueryRef[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const resp = await http.get('api/query');
    return resp.data as SavedQueryRef[];
};

/*
 * Requests metadata about a Saved Query, as well as its
 * 'context' - a JSON blob that can be parsed to
 * derive panels and panel filters that form the query.
 */
export const getSavedQueryContext = async (state: AppState, universalId: string) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.get(`/api/query/${universalId}`);
};

/*
 * Requests a Query Save to home node.
 */
export const saveQueryHomeNode = async (state: AppState, panels: PanelDTO[], panelFilters: PanelFilter[] ) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const id = state.cohort.networkCohorts.get(0)!.count.queryId;
    return http.post(`/api/query/${id}`, {
        ...state.queries.current,
        name: state.queries.current.name.trim(),
        category: state.queries.current.category.trim(),
        panels,
        panelFilters
    });
};

/*
 * Requests a Query Save to a federated node. In this case,
 * the UniversalId has already been recieved from home node,
 * so that forms part of the request body.
 */
export const saveQueryFedNode = async (
        state: AppState, nr: NetworkIdentity, panels: PanelDTO[], 
        panelFilters: PanelFilter[], queryId: string, universalId: string 
    ) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.post(`${nr.address}/api/query/${queryId}`, {
        ...state.queries.current,
        universalId,
        panels,
        panelFilters
    });
};

/*
 * Requests a delete on the Saved Query to the server.
 */
export const deleteSavedQuery = async (state: AppState, nr: NetworkIdentity, query: SavedQueryRef, force: boolean) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.delete(`${nr.address}/api/query/${query.universalId}`, {
        params: { force },
        paramsSerializer: () => `force=${force}`
    });
};

/*
 * Requests a preflight check on a given Saved Query.
 * The purpose of the preflight is to confirm that there 
 * are no permissions, etc. conflicts on any embedded queries
 * or Concepts that form the query.
 */
export const preflightSavedQuery = async (state: AppState, resourceRef: ResourceRef) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.post(`/api/query/preflight`, resourceRef);
};

/*
 * Requests an extension tree be derived and 
 * created from the worker. The return object is 
 * merged with the Concept tree.
 */
export const getExtensionRootConcepts = async (state: ImportState, imports: ImportMetadata[], queries: SavedQueryRef[]): Promise<Concept[]> => {
    const concepts = await worker.buildExtensionImportTree(state, imports, queries);
    return concepts as Concept[];
};

/*
 * Request a Saved Cohort tree be derived and 
 * created from the worker. The return object is 
 * merged with the Concept tree.
 */
export const getExtensionConcept = async (id: string): Promise<Concept | undefined> => {
    const concept = await worker.getExtensionConcept(id);
    return concept as Concept | undefined;
};

/*
 * Requests child extension concepts for a given concept.
 */
export const fetchExtensionConceptChildren = async (concept: Concept | Concept): Promise<Concept[]> => {
    const concepts = await worker.loadConceptChildren(concept);
    return concepts as Concept[];
};

/*
 * Deserializes a JSON string representing the Saved
 * state as a DTO object on query save. This hydrates 
 * panel and panel filter objects and validates that
 * any embedded queries or Concepts are still available
 * to the user.
 */
export const deserialize = async (queryDefJson: string, state: AppState, dispatch: any) => {
    const deser = JSON.parse(queryDefJson);

    /*
     * Update panels, setting dates and indexes
     */
    for (let p = 0; p < deser.panels!.length; p++) {
        const panel = { ...deser.panels[p], index: p } as Panel;
        panel.dateFilter.start.date = handleDate(panel.dateFilter.start.date);
        panel.dateFilter.end.date = handleDate(panel.dateFilter.end.date);

        /*
        * Update subpanels, setting date and indexes
        */
        for (let sp = 0; sp < panel.subPanels.length; sp++) {
            const subpanel = { ...panel.subPanels[sp], index: sp, panelIndex: p } as SubPanel;
            subpanel.dateFilter.date = handleDate(subpanel.dateFilter.date);

            /*
            * Update panelitems, concepts and indexes
            */
            for (let pi = 0; pi < subpanel.panelItems.length; pi++) {
                const panelItem = { ...subpanel.panelItems[pi], index: pi, subPanelIndex: sp, panelIndex: p } as any;
                const resRef = panelItem.resource as ResourceRef;

                // If saved query
                if (isNonstandard(resRef.universalId)) {
                    const embedded =  await getExtensionConcept(resRef.universalId!);
                    if (!embedded || !embedded.universalId) { 
                        throw new Error(`${resRef.uiDisplayName} is not an existing saved query or imported dataset.`); 
                    }
                    dispatch(setConcept(embedded))
                    panelItem.concept = embedded;
                // Else if concept
                } else {
                    const concept = await fetchConcept(state, resRef.id);
                    panelItem.concept = concept;
                    if (panelItem.numericFilter && panelItem.numericFilter.filter) {
                        let numFilter = panelItem.numericFilter.filter;
                        if (panelItem.numericFilter.filter.length === 0)      { numFilter = [ null, null ]; }
                        else if (panelItem.numericFilter.filter.length === 1) { numFilter = [ numFilter[0] as any, null ]; }
                        panelItem.numericFilter.filter = numFilter;
                    }
                }
                subpanel.panelItems[pi] = panelItem;
            }
            panel.subPanels[sp] = subpanel;
        }
        deser.panels[p] = panel;
    }
    return deser;
};

/*
 * Handles date objects from server. If the year
 * is < 1900, we know it represents a null date, so 
 * returns current date, else the initial parsed date value.
 */
const handleDate = (dateStr?: any): Date => {
    let date = moment();
    if (dateStr) {
        date = moment(dateStr);
        if (date.year() <= 1900) {
            return new Date();
        }
        return date.toDate();
    }
    return new Date();
};

/*
 * Loads a Saved Query from the server and
 * deserializes into a panels and panel filters.
 */
export const loadSavedQuery = async (universalId: string, state: AppState, dispatch: any): Promise<SavedQuery> => {
    const queryResp = await getSavedQueryContext(state, universalId);
    const queryRaw = queryResp.data as SavedQueryRefDTO;
    const deser = await deserialize(queryRaw.definition, state, dispatch) as SavedQueryDefinitionDTO;
    const query = { 
        ...deser,
        ...queryRaw, 
        created: new Date(queryResp.data.created), 
        updated: new Date(queryResp.data.updated)
    } as SavedQuery;
    return query;
};

/*
 * Detects whether the current panel array in state
 * has a recursive dependency where one embedded query
 * depends on itself or its depedents.
 */
export const hasRecursiveDependency = async (state: AppState): Promise<(string | null)> => {
    const curr = state.queries.current;
    const embedded = getEmbeddedQueries(state.panels);

    for (const e of embedded) {
        const c = e as Concept;
        const resp = await preflightSavedQuery(state, { id: c.extensionId!, universalId: c.universalId!, uiDisplayName: c.uiDisplayName });
        const dependents = (resp.data as PreflightCheckDTO).queryPreflight.results;
        for (const d of dependents) {
            if (d.id === curr.id) {
                return e.uiDisplayName;
            }
        }
    }
    return null;
};

/*
 * Derives a SavedQuery object needed to populate the 'My Saved Queries'
 * table. Called after a Save event.
 */
export const deriveSavedQuery = (state: AppState, response: QuerySaveResponseDTO): SavedQuery => {
    const { queries, cohort, auth, panels, panelFilters } = state;
    const currentUiQuery = queries.current;
    const { name, issuer } = auth.userContext!;
    const homeNodeCount = cohort.networkCohorts.get(0)!.count.value;
    let created = new Date();

    if (currentUiQuery.id) {
        const saved = queries.saved.get(currentUiQuery.id);
        if (saved) {
            created = saved.created;
        }
    }

    const saved: SavedQuery = {
        category: currentUiQuery.category,
        count: homeNodeCount,
        created,
        id: response.query.id,
        name: currentUiQuery.name,
        owner: `${name}@${issuer}`,
        panels,
        panelFilters,
        universalId: response.query.universalId,
        updated: new Date()
    };
    return saved;
};