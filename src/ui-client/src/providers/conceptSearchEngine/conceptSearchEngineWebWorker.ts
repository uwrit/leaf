/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { RootId, FirstChar, ConceptHintRef, MatchedConceptHintRef, ConceptHintRefGroup, AggregateConceptHintRef, ConceptHintDTO } from '../../models/concept/ConceptHint';
import { workerContext } from './conceptSearchEngineWebWorkerContext';

const ADD_CONCEPT_HINTS = 'ADD_CONCEPT_HINTS';
const ADD_CONCEPT_HINTS_AND_SEARCH = 'ADD_CONCEPT_HINTS_AND_SEARCH';
const INITIALIZE_SEARCH_ENGINE = 'INITIALIZE_SEARCH_ENGINE';
const SEARCH_CONCEPT_HINTS = 'SEARCH_CONCEPT_HINTS';

interface InboundMessagePartialPayload {
    displayThreshhold?: number;
    hints?: ConceptHintDTO[];
    message: string;
    rootId?: string;
    roots?: string[];
    searchString?: string;
}

interface InboundMessagePayload extends InboundMessagePartialPayload {
    requestId: string;
}

interface OutboundMessagePayload {
    requestId: string;
    result?: any;
}

interface WorkerReturnPayload {
    data: OutboundMessagePayload;
}

interface PromiseResolver {
    reject: any;
    resolve: any;
}

export default class ConceptSearchEngineWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([ADD_CONCEPT_HINTS, ADD_CONCEPT_HINTS_AND_SEARCH, INITIALIZE_SEARCH_ENGINE, SEARCH_CONCEPT_HINTS])}
            ${workerContext}
            self.onmessage = function(e) {  
                self.postMessage(handleWorkMessage.call(this, e.data, postMessage)); 
            }`;
        // console.log(workerFile);
        const blob = new Blob([workerFile], { type: 'text/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        this.worker.onmessage = result => this.handleReturnPayload(result);
        this.worker.onerror = error => { console.log(error); this.reject(error) };
    }

    public initializeSearchEngine = (displayThreshhold: number, roots: string[]) => {
        return this.postMessage({ message: INITIALIZE_SEARCH_ENGINE, displayThreshhold, roots });
    }

    public addConceptHints = (hints: ConceptHintDTO[], rootId: string) => {
        return this.postMessage({ message: ADD_CONCEPT_HINTS, hints, rootId });
    }

    public addConceptHintsAndSearch = (hints: ConceptHintDTO[], searchString: string, rootId: string) => {
        return this.postMessage({ message: ADD_CONCEPT_HINTS_AND_SEARCH, searchString, hints, rootId });
    }

    public searchConceptHints = (searchString: string, rootId: string) => {
        return this.postMessage({ message: SEARCH_CONCEPT_HINTS, searchString, rootId });
    }

    private postMessage = (payload: InboundMessagePartialPayload) => {
        return new Promise((resolve, reject) => {
            const requestId = generateId();
            this.reject = reject;
            this.promiseMap.set(requestId, { resolve, reject });
            this.worker.postMessage({ ...payload, requestId });
        });
    }

    private handleReturnPayload = (payload: WorkerReturnPayload): any => {
        const data = payload.data.result ? payload.data.result : {}
        const resolve = this.promiseMap.get(payload.data.requestId)!.resolve;
        this.promiseMap.delete(payload.data.requestId);
        return resolve(data);
    }

    private stripFunctionToContext = (f: () => any) => {
        const funcString = `${f}`;
        return funcString
            .substring(0, funcString.lastIndexOf('}'))
            .substring(funcString.indexOf('{') + 1)
    }

    private addMessageTypesToContext = (messageTypes: string[]) => {
        return messageTypes.map((v: string) => `var ${v} = '${v}';`).join(' ');
    }

    private workerContext = () => {

        const handleWorkMessage = (payload: InboundMessagePayload) => {
            switch (payload.message) {
                case ADD_CONCEPT_HINTS:
                    return addToCache(payload);
                case ADD_CONCEPT_HINTS_AND_SEARCH:
                    return addHintsAndSearch(payload);
                case SEARCH_CONCEPT_HINTS:
                    return search(payload);
                case INITIALIZE_SEARCH_ENGINE:
                    return initialize(payload);
                default:
                    return null;
            }
        };

        const cache: Map<RootId, Map<FirstChar, ConceptHintRefGroup[]>> = new Map();
        let maxHintsToReturn = 0;

        const addHintsAndSearch = (payload: InboundMessagePayload): OutboundMessagePayload => {
            addToCache(payload);
            return search(payload);
        };

        const groupSearchResults = (results: MatchedConceptHintRef[]): AggregateConceptHintRef[] => {
            const agg: Map<string, AggregateConceptHintRef> = new Map();
            const fullText: Set<string> = new Set();
            let thresholdMet = false;

            /*
             * First find 5 rows' worth of matches
             * and additional suggested tokens.
             */
            for (let i = 0; i < results.length; i++) {
                const match = results[i];

                /*
                 * Add to matched rows to be returned 
                 * if this ref has same matched tokens.
                 */
                agg.forEach((val) => {
                    if (match.matchedTerms === val.text && match.remainingTerms.has(val.suggestion)) {
                        val.ids.push(match.ref.id);
                    }
                });

                /*
                 * Try to add suggestions if still under threshold.
                 */
                const suggestions = Array.from(match.remainingTerms);
                for (let j = 0; j < suggestions.length && !thresholdMet; j++) {
                    const suggestion = suggestions[j];
                    const rowIdx = match.matchedTerms + suggestion;

                    if (!fullText.has(rowIdx)) {
                        const full = match.matchedTerms + ' ' + suggestion;
                        const row: AggregateConceptHintRef = {
                            ids: [ match.ref.id ],
                            fullText: full,
                            text: match.matchedTerms,
                            suggestion
                        };
                        agg.set(rowIdx, row);
                        fullText.add(rowIdx);

                        if (agg.size === maxHintsToReturn) {
                            thresholdMet = true;
                        }
                    }
                }
            }
            const out: AggregateConceptHintRef[] = [];
            agg.forEach((val) => out.push(val));
            return out;
        };

        const search = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { searchString, requestId, rootId } = payload;
            const terms = searchString!.trim().split(' ');
            const termCount = terms.length;
            const firstTerm = terms[0];
            const scopeTokens = cache.get(rootId!)!.get(firstTerm[0]);
            const hits: MatchedConceptHintRef[] = [];
            const groups: ConceptHintRefGroup[] = [];

            if (!searchString || !scopeTokens) {
                return { requestId, result: [] }; 
            }
            
            // ******************
            // First term
            // ******************
        
            // Foreach ref group compare with search term one
            for (let i1 = 0; i1 < scopeTokens.length; i1++) {
                const grp = scopeTokens[i1];
                if (grp.text.startsWith(firstTerm)) {
                    groups.push(grp);
                    for (let i2 = 0; i2 < grp.refs.length; i2++) {
                        const ref = grp.refs[i2];
                        hits.push({ matchedTerms: grp.text, remainingTerms: new Set(ref.tokens), ref })
                    }
                }
            }

            if (terms.length === 1) { 
                return { requestId, result: groupSearchResults(hits) };
            }
        
            // ******************
            // Following terms
            // ******************

            // For datasets found in loop one
            const final: MatchedConceptHintRef[] = []
            
            for (let g1 = 0; g1 < groups.length; g1++) {
                const grp = groups[g1];

                for (let r1 = 0; r1 < grp.refs.length; r1++) {
                    const ref = grp.refs[r1];
                    const tokens = ref.tokens.slice();
                    const matched: string[] = [ grp.text ];
                    let hitCount = 1;

                    // Foreach term after the first (e.g. [ 'white', 'blood' ])
                    // filter what first loop found and remove if no hit
                    for (let r2 = 1; r2 < termCount; r2++) {
                        const term = terms[r2];

                        // For each other token in Concept name
                        for (let j = 0; j < tokens.length; j++) {
                            if (tokens[j].startsWith(term)) { 
                                hitCount++;
                                matched.push(tokens[j]);
                                tokens.splice(j,1);
                                break;
                            }
                        }
                    }
                    if (hitCount === termCount) {
                        final.push({ matchedTerms: matched.join(' '), ref, remainingTerms: new Set(tokens) });
                    }
                }
            }
            
            return { requestId, result: groupSearchResults(final) };
        };

        const initialize = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { displayThreshhold, requestId, roots } = payload;
            maxHintsToReturn = displayThreshhold!;
            for (let i = 0; i < roots!.length; i++) {
                const root = roots![i];
                cache.set(root, new Map());
            }
            return { requestId }
        }
        
        const addToCache = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { hints, rootId, requestId } = payload;
            
            // Foreach hint
            for (let i = 0; i < hints!.length; i++) {
                const h = hints![i];

                for (let j = 0; j <= h.tokens.length - 1; j++) {
                    const token = h.tokens[j];
                    const first = token[0];
                    const ref: ConceptHintRef = {
                        id: h.conceptId,
                        text: token,
                        tokens: h.tokens.slice().filter((t, i) => i !== j)
                    };

                    // Root
                    const cacheRoot = cache.get(rootId!)!;

                    // Groups by first char
                    const groups = cacheRoot.get(first);
                    if (groups) {

                        // Find refs matching this text
                        const group = groups.find((g) => g.text === token);
                        if (group) {
                            if (!group.refs.find((r) => r.id === h.conceptId)) {
                                group.refs.push(ref);
                            }
                        } else {
                            groups.push({ text: token, refs: [ ref ] } )
                        }
                    } else {
                        cacheRoot.set(first, [ 
                            { text: token, refs: [ ref ] } 
                        ]);
                    }
                }
            }
            return { requestId, result: [] };
        };
    };
};