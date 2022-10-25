/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { workerContext } from './ helpPageSearchWebWorkerContext';

const INITIALIZE_SEARCH_ENGINE = 'INITIALIZE_SEARCH_ENGINE'; /* <-- Used when we get words from each help page */
const SEARCH_HELP_PAGES = 'SEARCH_HELP_PAGES';

interface SearchEngineEntry {
    helpPageId: string;
    terms: string[];
}

/**
 * Only interface that matters is this.
 * Acts almost exactly like a Redux action/reducer
 */
interface InboundMessagePartialPayload {
    searchEngineEntries?: SearchEngineEntry[];
    searchString?: string;
    /* add other possible params here */
    message: string; /* <- string name of job you want it to do */
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

export default class HelpPageSearchWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    // ${this.stripFunctionToContext(this.workerContext)}
    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([ INITIALIZE_SEARCH_ENGINE, SEARCH_HELP_PAGES ])}
            ${workerContext}
            self.onmessage = function(e) {  
                self.postMessage(handleWorkMessage.call(this, e.data, postMessage)); 
            }`;
        // console.log(workerFile);
        const blob = new Blob([workerFile], { type: 'text/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        this.worker.onmessage = result => this.handleReturnPayload(result);
        this.worker.onerror = error => this.reject(error);
    }

    /**
     * Add other external-facing function calls here
     */
    public initSearch = (searchEngineEntries?: SearchEngineEntry[]) => {
        return this.postMessage({ message: INITIALIZE_SEARCH_ENGINE, searchEngineEntries });
    }

    public searchHelpPages = (searchString: string) => {
        return this.postMessage({ message: SEARCH_HELP_PAGES, searchString });
    }

    private postMessage = (payload: InboundMessagePartialPayload) => {
        return new Promise((resolve, reject) => {
            const requestId = generateId();
            this.reject = reject;
            this.promiseMap.set(requestId, { resolve, reject });
            this.worker.postMessage({ ...payload, requestId });
        })
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

        let persistedSearchEngineEntries: SearchEngineEntry[] = [];

        // eslint-disable-next-line
        const handleWorkMessage = (payload: InboundMessagePayload) => {
            switch (payload.message) {
                case INITIALIZE_SEARCH_ENGINE:
                    return initSearch(payload);
                case SEARCH_HELP_PAGES:
                    return searchHelpPages(payload);
                default:
                    return null;
            }
        };

        const initSearch = (payload: InboundMessagePayload): OutboundMessagePayload => {

            // Start like this
            const { searchEngineEntries, requestId } = payload;

            // Init search ...
            persistedSearchEngineEntries = searchEngineEntries!;

            // End like this
            return { requestId };
        };

        const searchHelpPages = (payload: InboundMessagePayload): OutboundMessagePayload => {

            // Start like this
            const { searchString, requestId } = payload;
            const hitResultMap = new Map<number, string[]>();
            const searchTerms = searchString!.trim().split(' ');

            // Do search ...
            if (!searchString) {
                return { requestId, result };
            };

            for (let se = 0; se < persistedSearchEngineEntries.length; se++) {
                const entry = persistedSearchEngineEntries[se];
                let hitCount = 0;

                for (let st = 0; st < searchTerms.length; st++) {
                    if (entry.terms.includes(searchTerms[st])) {
                        hitCount++;
                    };
                };
                    
                if (hitCount > 0 && hitResultMap.has(hitCount)) {
                    const existingPages = hitResultMap.get(hitCount)!;
                    hitResultMap.set(hitCount, [ ...existingPages, entry.helpPageId ]);
                } else {
                    hitResultMap.set(hitCount, [ entry.helpPageId ]);
                };
            };

            const sortedHits = Array.from(hitResultMap.keys()).sort();
            if (sortedHits.length >= 5) {
                
            }
            



            // End like this
            return { requestId, result };
        }
    }
}

