/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../models/state/AppState';
import { HttpFactory } from './HttpFactory';
import { SavedQueryRef, SavedQuery, SavedQueryRefDTO, SavedQueryDefinitionDTO } from '../models/Query';
import ExtensionConceptsWebWorker from '../providers/extensionConcepts/extensionConceptsWebWorker';
import { PanelDTO, Panel } from '../models/panel/Panel';
import { PanelFilter } from '../models/panel/PanelFilter';
import { NetworkIdentity } from '../models/NetworkRespondent';
import { ResourceRef, ExtensionConcept } from '../models/concept/Concept';
import { fetchConcept } from '../services/conceptApi';
import moment from 'moment';
import { SubPanel } from '../models/panel/SubPanel';
import { PreflightCheckDTO } from '../models/PatientCountDTO';
import { getEmbeddedQueries, isEmbeddedQuery } from '../utils/panelUtils';
import { PanelItem } from '../models/panel/PanelItem';

const worker = new ExtensionConceptsWebWorker();

export const getSavedQueries = async (state: AppState) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.get('api/query');
};

export const getSavedQueryContext = async (state: AppState, universalId: string) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.get(`/api/query/${universalId}`);
};

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

export const saveQueryFedNode = async (state: AppState, nr: NetworkIdentity, panels: PanelDTO[], panelFilters: PanelFilter[], queryId: string, universalId: string ) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.post(`${nr.address}/api/query/${queryId}`, {
        ...state.queries.current,
        universalId,
        panels,
        panelFilters
    });
};

export const deleteSavedQuery = async (state: AppState, nr: NetworkIdentity, query: SavedQueryRef, force: boolean) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.delete(`${nr.address}/api/query/${query.universalId}`, {
        params: { force },
        paramsSerializer: () => `force=${force}`
    });
};

export const preflightSavedQuery = async (state: AppState, resourceRef: ResourceRef) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    return http.post(`/api/query/preflight`, resourceRef);
};

export const getQueriesAsConcepts = async (queries: SavedQueryRef[]) => {
    const concepts = await worker.buildSavedCohortTree(queries);
    return concepts;
};

export const deserialize = async (queryDefJson: string, state: AppState) => {
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
                if (isEmbeddedQuery(resRef.universalId)) {
                    const embedded = state.concepts.extensionTree.get(resRef.universalId!);
                    if (!embedded) { 
                        throw `${resRef.uiDisplayName} is not an existing saved query.`; 
                    }
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

export const loadSavedQuery = async (universalId: string, state: AppState): Promise<SavedQuery> => {
    const queryResp = await getSavedQueryContext(state, universalId);
    const queryRaw = queryResp.data as SavedQueryRefDTO;
    const deser = await deserialize(queryRaw.definition, state) as SavedQueryDefinitionDTO;
    const query = { 
        ...deser,
        ...queryRaw, 
        created: new Date(queryResp.data.created), 
        updated: new Date(queryResp.data.updated)
    } as SavedQuery;
    return query;
};

export const hasRecursiveDependency = async (state: AppState): Promise<(string | null)> => {
    const curr = state.queries.current;
    const embedded = getEmbeddedQueries(state.panels);

    for (const e of embedded) {
        const c = e as ExtensionConcept;
        const resp = await preflightSavedQuery(state, { id: c.extensionId, universalId: c.universalId!, uiDisplayName: c.uiDisplayName });
        const dependents = (resp.data as PreflightCheckDTO).queryPreflight.results;
        for (const d of dependents) {
            if (d.id === curr.id) {
                return e.uiDisplayName;
            }
        }
    }
    return null;
};