/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

// tslint:disable
import { generate as generateId } from 'shortid';
import { TokenizedDatasetRef, PatientListDatasetQueryDTO, CategorizedDatasetRef, PatientListDatasetShape } from '../../models/patientList/Dataset';
import { workerContext } from './datasetSearchWebWorkerContext';

const ADD_DATASETS = 'ADD_DATASETS';
const ALLOW_DATASET_IN_SEARCH = 'ALLOW_DATASET_IN_SEARCH';
const ALLOW_ALL_DATASETS = 'ALLOW_ALL_DATASETS';
const SEARCH_DATASETS = 'SEARCH_DATASETS';

interface InboundMessagePartialPayload {
    datasetId?: string;
    datasets?: PatientListDatasetQueryDTO[];
    include?: boolean;
    message: string;
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

export default class DatasetSearchEngineWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([ADD_DATASETS, SEARCH_DATASETS, ALLOW_DATASET_IN_SEARCH, ALLOW_ALL_DATASETS])}
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

    public addDatasets = (datasets: PatientListDatasetQueryDTO[]) => {
        return this.postMessage({ message: ADD_DATASETS, datasets });
    }

    public allowDatasetInSearch = (datasetId: string, include: boolean) => {
        return this.postMessage({ message: ALLOW_DATASET_IN_SEARCH, datasetId, include });
    }

    public allowAllDatasets = () => {
        return this.postMessage({ message: ALLOW_ALL_DATASETS });
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

        const handleWorkMessage = (payload: InboundMessagePayload) => {
            switch (payload.message) {
                case ADD_DATASETS:
                    return addDatasetsToCache(payload);
                case SEARCH_DATASETS:
                    return searchDatasets(payload);
                case ALLOW_DATASET_IN_SEARCH:
                    return allowDatasetInSearch(payload);
                case ALLOW_ALL_DATASETS:
                    return allowAllDatasets(payload);
                default:
                    return null;
            }
        };

        // Dataset cache
        const datasetCache: Map<string, PatientListDatasetQueryDTO> = new Map();
        const excluded: Set<string> = new Set();
        let allDatasets: CategorizedDatasetRef[] = [];
        let allowedDatasets: CategorizedDatasetRef[] = [];

        // Map of first char of full terms
        const firstCharCache: Map<string, TokenizedDatasetRef[]> = new Map();

        const allowAllDatasets = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId } = payload;
            excluded.clear()
            allowedDatasets = allDatasets.slice();
            return { requestId, result: allDatasets };
        };

        const allowDatasetInSearch = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId, datasetId, include } = payload;

            if (include) {
                excluded.delete(datasetId!);
            } else {
                excluded.add(datasetId!);
            }
            updateAllowedDatasets();
            return { requestId };
        };

        const updateAllowedDatasets = () => {
            allowedDatasets = [];

            for (let i = 0; i < allDatasets.length; i++) {
                const datasets: PatientListDatasetQueryDTO[] = [];
                const cat = allDatasets[i];
                for (let j = 0; j < cat.datasets.length; j++) {
                    const ds = cat.datasets[j];
                    if (!excluded.has(ds.id)) {
                        datasets.push(ds);
                    }
                }
                if (datasets.length) {
                    allowedDatasets.push({ 
                        category: cat.category,
                        datasets
                    });
                }
            }
        };

        const searchDatasets = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { searchString, requestId } = payload;
            const terms = searchString!.trim().split(' ');
            const termCount = terms.length;
            const firstTerm = terms[0];
            const allDs = firstCharCache.get(firstTerm[0]);
            const dsOut: TokenizedDatasetRef[] = [];

            if (!searchString) {
                return { requestId, result: allowedDatasets }; 
            }
            if (!allDs) { 
                return { requestId, result: [] }; 
            }
            
            // ******************
            // First term
            // ******************
        
            // Foreach dataset compare with search term one
            for (let i1 = 0; i1 < allDs.length; i1++) {
                const ds = allDs[i1];
                if (!excluded.has(ds.id) && ds.token.startsWith(firstTerm)) {
                    dsOut.push(ds);
                }
            }

            if (terms.length === 1) { 
                return { requestId, result: dedupeAndSortTokenized(dsOut) };
            }
        
            // ******************
            // Following terms
            // ******************

            // For datasets found in loop one
            const dsFinal: TokenizedDatasetRef[] = []
            for (let dsIdx = 0; dsIdx < dsOut.length; dsIdx++) {
                const otherTokens = dsOut[dsIdx].tokenArray.slice();
                let hitCount = 1;

                // Foreach term after the first (e.g. [ 'white', 'blood' ])
                // filter what first loop found and remove if no hit
                for (let i2 = 1; i2 < termCount; i2++) {
                    const term = terms[i2];

                    // For each other term associated with the dataset name
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

        const dedupeAndSortTokenized = (refs: TokenizedDatasetRef[]): CategorizedDatasetRef[] => {
            const ds = refs.map((r) => r.dataset);
            return dedupeAndSort(ds);
        };

        const dedupeAndSort = (refs: PatientListDatasetQueryDTO[]): CategorizedDatasetRef[] => {
            const added: Set<string> = new Set();
            const catIdxMap: Map<string,number> = new Map();
            let out: CategorizedDatasetRef[] = [];

            for (let i = 0; i < refs.length; i++) {
                const ref = refs[i];
                const cat = ref.category ? ref.category : '';

                /*
                 * Add the dataset.
                 */
                if (!added.has(ref.id)) {
                    /*
                     * Add the category.
                     */
                    let catIdx = catIdxMap.get(cat);
                    if (catIdx !== undefined) {
                        out[catIdx].datasets.push(ref);
                    } else {
                        catIdxMap.set(cat, out.length);
                        out.push({
                            category: cat,
                            datasets: [ ref ]
                        })
                    }
                    added.add(ref.id);
                }
            }
            return out.sort(categorySorter);
        };

        const categorySorter = (a: CategorizedDatasetRef, b: CategorizedDatasetRef) => {
            a.datasets.sort(datasetSorter);
            b.datasets.sort(datasetSorter);
            return a.category.localeCompare(b.category);
        };

        const datasetSorter = (a: PatientListDatasetQueryDTO, b: PatientListDatasetQueryDTO) => {
            return a.name.localeCompare(b.name);
        };

        const addDatasetsToCache = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { datasets, requestId } = payload;
            const allDs = [];
        
            // Foreach dataset
            for (let i = 0; i < datasets!.length; i++) {
                const ds = datasets![i];
                if (ds.shape === 3) { continue; } // Ensure Demographics-shape datasets are excluded.

                let tokens = ds.name.toLowerCase().split(' ');
                if (ds.category) { tokens = tokens.concat(ds.category.toLowerCase().split(' ')); }
                if (ds.description) { tokens = tokens.concat(ds.description.toLowerCase().split(' ')); }

                for (let j = 0; j <= tokens.length - 1; j++) {
                    const token = tokens[j];
                    const ref: TokenizedDatasetRef = {
                        id: ds.id,
                        dataset: ds,
                        token,
                        tokenArray: tokens.filter((t) => t !== token)
                    }
                    const firstChar = token[0];
            
                    // Cache the first first character for quick lookup
                    if (!firstCharCache.has(firstChar)) {
                        firstCharCache.set(firstChar, [ ref ]);
                    }
                    else {
                        firstCharCache.get(firstChar)!.push(ref);
                    }
                }
                datasetCache.set(ds.id, ds);
                allDs.push(ds);
            }
            allDatasets = dedupeAndSort(allDs);
            updateAllowedDatasets();
            return { requestId, result: allDatasets };
        };
    };
}