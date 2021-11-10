/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { TokenizedDatasetRef, PatientListDatasetQuery, CategorizedDatasetRef, DatasetSearchResult, PatientListDatasetQueryIndex } from '../../models/patientList/Dataset';
import { workerContext } from './datasetSearchWebWorkerContext';

const REINDEX_DATASETS = 'REINDEX_DATASETS';
const ALLOW_DATASET_IN_SEARCH = 'ALLOW_DATASET_IN_SEARCH';
const ALLOW_ALL_DATASETS = 'ALLOW_ALL_DATASETS';
const SET_ADMIN_MODE = 'SET_ADMIN_MODE';
const SEARCH_DATASETS = 'SEARCH_DATASETS';

interface InboundMessagePartialPayload {
    admin?: boolean;
    allow?: boolean;
    datasetId?: string;
    datasets?: PatientListDatasetQuery[];
    message: string;
    searchString?: string;
}

interface InboundMessagePayload extends InboundMessagePartialPayload {
    requestId: string;
}

interface OutboundMessagePayload {
    requestId: string;
    result?: DatasetSearchResult;
}

interface WorkerReturnPayload {
    data: OutboundMessagePayload;
}

interface PromiseResolver {
    reject: any;
    resolve: any;
}

export default class DatasetSearchEngineWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([REINDEX_DATASETS, SEARCH_DATASETS, ALLOW_DATASET_IN_SEARCH, ALLOW_ALL_DATASETS, SET_ADMIN_MODE])}
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

    public reindexDatasets = (datasets: PatientListDatasetQuery[]) => {
        return this.postMessage({ message: REINDEX_DATASETS, datasets });
    }

    public allowDatasetInSearch = (datasetId: string, allow: boolean, searchString: string) => {
        return this.postMessage({ message: ALLOW_DATASET_IN_SEARCH, datasetId, allow, searchString });
    }

    public allowAllDatasets = () => {
        return this.postMessage({ message: ALLOW_ALL_DATASETS });
    }

    public setAdminMode = (admin: boolean) => {
        return this.postMessage({ message: SET_ADMIN_MODE, admin });
    }

    public searchDatasets = (searchString: string) => {
        return this.postMessage({ message: SEARCH_DATASETS, searchString });
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

        // eslint-disable-next-line
        const handleWorkMessage = (payload: InboundMessagePayload) => {
            switch (payload.message) {
                case REINDEX_DATASETS:
                    return reindexCacheFromExternal(payload);
                case SEARCH_DATASETS:
                    return searchDatasets(payload);
                case ALLOW_DATASET_IN_SEARCH:
                    return allowDataset(payload);
                case ALLOW_ALL_DATASETS:
                    return allowAllDatasets(payload);
                case SET_ADMIN_MODE:
                    return setAdminMode(payload);
                default:
                    return null;
            }
        };

        /*
         * Shared cache.
         */
        const demographics: PatientListDatasetQuery = { id: 'demographics', shape: 3, category: '', isEncounterBased: false, name: 'Basic Demographics', tags: [] };
        const firstCharCache: Map<string, TokenizedDatasetRef[]> = new Map();
        let excluded: Map<string, PatientListDatasetQuery> = new Map([[ demographics.id, demographics ]]);
        let allDs: Map<string, PatientListDatasetQuery> = new Map();

        /*
         * Admin-facing cache.
         */
        let isAdmin = false;
        let allCatDsAdmin: Map<string, CategorizedDatasetRef> = new Map();
        let defaultOrderAdmin: Map<string, PatientListDatasetQueryIndex> = new Map();

        /*
         * User-facing cache.
         */
        let allCatDs: Map<string, CategorizedDatasetRef> = new Map();
        let defaultOrder: Map<string, PatientListDatasetQueryIndex> = new Map();

        /*
         * Set whether the worker should return search results to an admin (i.e., no exclusions),
         * or to a user.
         */
        const setAdminMode = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId, admin } = payload;
            isAdmin = admin!;
            return { requestId, result: returnDefault() };
        };

        /*
         * Return the default display depending on whether the current mode is admin or user.
         */

        const returnDefault = (): DatasetSearchResult => {
            if (isAdmin) {
                return { categories: allCatDsAdmin, displayOrder: defaultOrderAdmin };
            }
            return { categories: allCatDs, displayOrder: defaultOrder };
        };

        /*
         * Flatten categorized datasets map into an array of datasets.
         */
        const getAllDatasetsArray = (): PatientListDatasetQuery[] => {
            const copy = new Map(allDs);
            if (!isAdmin) {
                copy.delete(demographics.id);
            }
            return [ ...copy.values() ];
        };
        
        /* 
         * Reset excluded datasets cache. Called when users
         * reset the cohort and the patient list too is reset.
         */
        const allowAllDatasets = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId } = payload;

            excluded.clear();
            excluded.set(demographics.id, demographics);
            /*
             * Get default display and sort order.
             */
            const reSorted = dedupeAndSort(getAllDatasetsArray());
            allCatDs = reSorted.categories;
            defaultOrder = reSorted.displayOrder;

            return { requestId, result: returnDefault() };
        };

        /*
         * Allow or disallow a dataset to be included in search results.
         * Called as users add/remove datasets from the patient list screen.
         */
        const allowDataset = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { datasetId, allow } = payload;

            if (allow) {
                excluded.delete(datasetId!);
            } else {
                const ds = allDs.get(datasetId!);
                if (ds) {
                    excluded.set(ds.id, ds);
                }
            }
            const datasets = getAllDatasetsArray().filter((ds) => !excluded.has(ds.id));
            const reSorted = dedupeAndSort(datasets);
            allCatDs = reSorted.categories;
            defaultOrder = reSorted.displayOrder;
            
            return searchDatasets(payload);
        };

        /*
         * Search through available datasets.
         */
        const searchDatasets = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { searchString, requestId } = payload;
            const terms = searchString!.trim().split(' ');
            const termCount = terms.length;
            const firstTerm = terms[0];
            const datasets = firstCharCache.get(firstTerm[0]);
            const dsOut: TokenizedDatasetRef[] = [];

            if (!searchString) {
                return { requestId, result: returnDefault() }; 
            }
            if (!datasets) { 
                return { requestId, result: { categories: new Map(), displayOrder: new Map() } }; 
            }
            
            // ******************
            // First term
            // ******************
        
            /* 
             * Foreach dataset compare with search term one. If demographics
             * are disabled this is for a user, so leave out excluded datasets.
             */
            if (!isAdmin) {
                for (let i1 = 0; i1 < datasets.length; i1++) {
                    const ds = datasets[i1];
                    if (!excluded.has(ds.id) && ds.token.startsWith(firstTerm)) {
                        dsOut.push(ds);
                    }
                }
            /* 
             * Else this is for an admin in the admin panel, so there are no exclusions.
             */
            } else {
                for (let i1 = 0; i1 < datasets.length; i1++) {
                    const ds = datasets[i1];
                    if (ds.token.startsWith(firstTerm)) {
                        dsOut.push(ds);
                    }
                }
            }

            if (terms.length === 1) { 
                return { requestId, result: dedupeAndSortTokenized(dsOut) };
            }
        
            // ******************
            // Following terms
            // ******************

            /*
             * For datasets found in loop one
             */
            const dsFinal: TokenizedDatasetRef[] = []
            for (let dsIdx = 0; dsIdx < dsOut.length; dsIdx++) {
                const otherTokens = dsOut[dsIdx].tokenArray.slice();
                let hitCount = 1;

                /* 
                 * Foreach term after the first (e.g. [ 'white', 'blood' ])
                 * filter what first loop found and remove if no hit
                 */
                for (let i2 = 1; i2 < termCount; i2++) {
                    const term = terms[i2];

                    /* 
                     * For each other term associated with the dataset name
                     */
                    for (let j = 0; j < otherTokens.length; j++) {
                        if (otherTokens[j].startsWith(term)) { 
                            hitCount++;
                            otherTokens.splice(j,1);
                            break;
                        }
                    }
                    if (!otherTokens.length)
                        break;
                }
                if (hitCount === termCount) {
                    dsFinal.push(dsOut[dsIdx])
                }
            }

            return { requestId, result: dedupeAndSortTokenized(dsFinal) };
        };

        /*
         * Extract datasets from tokenized refs and returns
         * a sorted, deduped result array.
         */
        const dedupeAndSortTokenized = (refs: TokenizedDatasetRef[]): DatasetSearchResult => {
            const ds = refs.map((r) => r.dataset);
            return dedupeAndSort(ds);
        };

        /*
         * Remove duplicates, sort alphabetically, and
         * return a displayable categorized array of datasets.
         */
        const dedupeAndSort = (refs: PatientListDatasetQuery[]): DatasetSearchResult => {
            const addedDatasets: Set<string> = new Set();
            const addedRefs: PatientListDatasetQuery[] = [];
            const out: Map<string, CategorizedDatasetRef> = new Map();
            const displayOrder: Map<string, PatientListDatasetQueryIndex> = new Map();
            let includesDemographics = false;

            /*
             * Get unique only.
             */
            for (let i = 0; i < refs.length; i++) {
                const ref = refs[i];
                if (!addedDatasets.has(ref.id)) {
                    if (ref.shape === 3) {
                        includesDemographics = true;
                    } else {
                        if (!ref.category) {
                            ref.category = '';
                        }
                        addedRefs.push(ref);
                        addedDatasets.add(ref.id);
                    }
                }
            }

            /*
             * Sort.
             */
            const sortedRefs = addedRefs.sort((a,b) => {
                if (a.category === b.category) { 
                    return a.name > b.name ? 1 : -1;
                }
                return a.category > b.category ? 1 : -1;
            });
            if (includesDemographics) { sortedRefs.unshift(demographics); }
            const len = sortedRefs.length;
            const lastIdx = len-1;

            /*
             * Add to map.
             */
            for (let i = 0; i < len; i++) {
                const ref = sortedRefs[i];
                const catObj = out.get(ref.category);
                const order: PatientListDatasetQueryIndex = {
                    prevId: i > 0 ? sortedRefs[i-1].id : sortedRefs[lastIdx].id,
                    nextId: i < lastIdx ? sortedRefs[i+1].id : sortedRefs[0].id
                }
                displayOrder.set(ref.id, order);
                
                if (catObj) {
                    catObj.datasets.set(ref.id, ref);
                } else {
                    out.set(ref.category, { category: ref.category, datasets: new Map([[ ref.id, ref ]]) })
                }
            }
            return { categories: out, displayOrder };
        };

        const reindexCacheFromExternal = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId, datasets } = payload;
            const sorted = reindexCacheCache(datasets!);
            return { requestId, result: sorted }
        }   

        /*
         * Reset the dataset search cache and (re)load
         * it with inbound datasets.
         */
        const reindexCacheCache = (datasets: PatientListDatasetQuery[]): DatasetSearchResult => {
            
            /*
             * Ensure 'Demographics'-shaped datasets are excluded (they shouldn't be here, but just to be safe).
             */
            const all = datasets!.slice().filter((ds) => ds.shape !== 3);
            all.unshift(demographics);
            allDs.clear();
            allCatDs.clear();
            allCatDsAdmin.clear();
            allCatDsAdmin.set('', { category: '', datasets: new Map([[ demographics.id, demographics ]]) });
            firstCharCache.clear();
            excluded.clear();
            excluded.set(demographics.id, demographics);
        
            /* 
             * Foreach dataset
             */
            for (let i = 0; i < all.length; i++) {
                const ds = all[i];
                let tokens = ds.name.toLowerCase().split(' ').concat(ds.tags.map(t => t.toLowerCase()));
                if (ds.category) { tokens = tokens.concat(ds.category.toLowerCase().split(' ')); }
                if (ds.description) { tokens = tokens.concat(ds.description.toLowerCase().split(' ')); }
                allDs.set(ds.id, ds);

                for (let j = 0; j <= tokens.length - 1; j++) {
                    const token = tokens[j];
                    const ref: TokenizedDatasetRef = {
                        id: ds.id,
                        dataset: ds,
                        token,
                        tokenArray: tokens.filter((t) => t !== token)
                    }
                    const firstChar = token[0];
            
                    /* 
                     * Cache the first first character for quick lookup.
                     */
                    if (!firstCharCache.has(firstChar)) {
                        firstCharCache.set(firstChar, [ ref ]);
                    } else {
                        firstCharCache.get(firstChar)!.push(ref);
                    }
                }
            }

            /*
             * Set admin search default display.
             */
            const adminSorted = dedupeAndSort(all);
            allCatDsAdmin = adminSorted.categories;
            defaultOrderAdmin = adminSorted.displayOrder;

            /*
             * Set user search default display.
             */
            all.shift();
            const userSorted = dedupeAndSort(all);
            allCatDs = userSorted.categories;
            defaultOrder = userSorted.displayOrder;

            return userSorted;
        };
    };
}