/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { AppState } from '../models/state/AppState';
import { AggregateConceptHintRef, ConceptHintDTO } from '../models/concept/ConceptHint';
import ConceptSearchEngineWebWorker from '../providers/conceptSearchEngine/conceptSearchEngineWebWorker';
import { HttpFactory } from './HttpFactory';

let lastServerSearchTerm = '';
let lastServerRootId = '';
let lastServerResultCount = 1;
let currentRunningServerCalls = 0;
const displayThreshold = 5;
const maxParallelServerCalls = 4;
const engine = new ConceptSearchEngineWebWorker();

/*
 * Fetch concept hints from server.
 */
const fetchConceptHintsFromServer = async (term: string, rootId: string, state: AppState) => {
    ++currentRunningServerCalls; 
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const request = await http.get('api/concept/search/hints', {
        params: {
            rootParentId: rootId,
            term
        }
    });
    const result = request.data as ConceptHintDTO[];
    lastServerSearchTerm = term;
    lastServerResultCount = result.length;
    lastServerRootId = rootId;
    --currentRunningServerCalls;

    return result;
};

/*
 * Fetch equivalent (e.g., ICD9->10) hint from server.
 */
export const fetchConceptEquivalentHintFromServer = async (term: string, state: AppState) => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const request = http.get('api/concept/search/equivalent', {
        params: {
            term
        }
    });
    return request;
};

/*
 * Determine whether server should be queried or not.
 */
const shouldQueryServer = (term: string, rootId: string): boolean => {
    if (
        term.length > 0 &&
        currentRunningServerCalls < maxParallelServerCalls &&
        !(term.startsWith(lastServerSearchTerm) && 
          rootId === lastServerRootId &&
            (Math.abs(term.length - lastServerSearchTerm.length) < 3 || lastServerResultCount === 0)
         )
    ) {
        return true;
    }
    return false;
};

/*
 * Get concept hints by first querying the local engine,
 * then falling back to server if the number of hints found
 * is less than the default display.
 */
export const getHints = async (state: AppState, term: string) => {
    return new Promise( async (resolve, reject) => {

        if (!term.trim().length) { return resolve([]); }
        const cleaned = term.trim().toLowerCase();
        const rootId = state.conceptSearch.rootId;

        /* 
         * Try querying local engine with currently cached concept hints.
         */
        let results = await engine.searchConceptHints(cleaned, rootId) as AggregateConceptHintRef[];

        /* 
         * Check if initial search results were sufficient and we aren't already searching for this.
         */
        if (results.length < displayThreshold && shouldQueryServer(term, rootId)) {

            /*
             * Try calling server.
             */
            const serverResults = await fetchConceptHintsFromServer(cleaned, rootId, state);

            /*
             * Load new hints from server and re-query engine.
             */
            if (serverResults.length) {
                results = await engine.addConceptHintsAndSearch(serverResults, cleaned, rootId) as AggregateConceptHintRef[];
            }
            return resolve(results);
        }
        else {
            /*
             * Else the local concept hints were sufficient, so return those.
             */
            return resolve(results.slice(0, displayThreshold));
        }
    });
};

/*
 * Request an initilization to the engine. This tells the
 * the web worker the root concepts to expect for future searches.
 */
export const initializeSearch = async (state: AppState) => {
    // Add the 'All Concepts' root, ''
    const roots = state.concepts.roots.slice();
    roots.push('');
    await engine.initializeSearchEngine(displayThreshold, roots);
};