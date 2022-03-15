/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { DemographicRow } from '../../models/cohortData/DemographicDTO';
import { workerContext } from './patientSearchWebWorkerContext';

const REINDEX_PATIENTS = 'REINDEX_PATIENTS';
const SEARCH_PATIENTS = 'SEARCH_PATIENTS';

interface InboundMessagePartialPayload {
    patients?: DemographicRow[];
    top?: number;
    message: string;
    searchString?: string;
}

interface InboundMessagePayload extends InboundMessagePartialPayload {
    requestId: string;
}

interface OutboundMessagePayload {
    requestId: string;
    result?: DemographicRow[];
}

interface WorkerReturnPayload {
    data: OutboundMessagePayload;
}

interface PromiseResolver {
    reject: any;
    resolve: any;
}

interface IndexedDemographicRow {
    patient: DemographicRow;
    tokens: string[];
}

export default class PatientSearchEngineWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([REINDEX_PATIENTS, SEARCH_PATIENTS])}
            ${this.stripFunctionToContext(this.workerContext)}
            self.onmessage = function(e) {  
                self.postMessage(handleWorkMessage.call(this, e.data, postMessage)); 
            }`;
        // console.log(workerFile);
        const blob = new Blob([workerFile], { type: 'text/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        this.worker.onmessage = result => this.handleReturnPayload(result);
        this.worker.onerror = error => { console.log(error); this.reject(error) };
    }

    public reindexPatients = (patients: DemographicRow[]) => {
        return this.postMessage({ message: REINDEX_PATIENTS, patients });
    }

    public searchPatients = (searchString: string, top?: number) => {
        return this.postMessage({ message: SEARCH_PATIENTS, searchString, top });
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
                case REINDEX_PATIENTS:
                    return reindexCache(payload);
                case SEARCH_PATIENTS:
                    return searchPatients(payload);
                default:
                    return null;
            }
        };

        const firstCharCache: Map<string, IndexedDemographicRow[]> = new Map();
        let allPatients: IndexedDemographicRow[] = [];

        /**
         * Search through available patients
         */
        const searchPatients = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { searchString, top, requestId } = payload;
            const terms = searchString!.trim().split(' ');
            const termCount = terms.length;
            const firstTerm = terms[0];
            const patients = firstCharCache.get(firstTerm[0]);
            const output: IndexedDemographicRow[] = [];

            if (!searchString) {
                return { requestId, result: sort(allPatients) }; 
            }
            if (!patients) {
                return { requestId, result: [] };
            }
            
            // ******************
            // First term
            // ******************
            if (terms.length === 1) { 
                return { requestId, result: sort(patients, top) };
            }
        
            // ******************
            // Following terms
            // ******************

            /**
             * For patients found in term one
             */
            for (let pi = 0; pi < patients.length; pi++) {
                const tokens = patients[pi].tokens;
                let hitCount = 1;

                /**
                 * Foreach term after the first (e.g. [ 'jane', 'doe' ])
                 * filter what first loop found and remove if no hit
                 */
                for (let i = 1; i < termCount; i++) {
                    const term = terms[i];

                    /**
                     * For each other term associated with the patient
                     */
                    for (let j = 0; j < tokens.length; j++) {
                        if (tokens[j].startsWith(term)) { 
                            hitCount++;
                            tokens.splice(j,1);
                            break;
                        }
                    }
                    if (!tokens.length)
                        break;
                }
                if (hitCount === termCount) {
                    output.push(patients[pi])
                }
            }

            return { requestId, result: sort(output) };
        };

        const sort = (patients: IndexedDemographicRow[], top?: number): DemographicRow[] => {
            let _patients = patients.slice();
            if (top) {
                _patients = _patients.slice(0, top);
            }
            return patients
                .map(p => p.patient)
                .sort((a,b) => a.name > b.name ? 1 : -1);
        };

        /**
         * Reset the patient search cache
         */
        const reindexCache = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { patients, requestId } = payload;
            firstCharCache.clear();
            allPatients = [];
        
            /**
             * Foreach patient
             */
            for (let i = 0; i < patients!.length; i++) {
                const patient = patients![i];
                const tokens = patient.name.toLowerCase().replace(',',' ').split(' ').concat([ patient.mrn.toLowerCase() ]);
                const indexed: IndexedDemographicRow = { patient, tokens };
                allPatients.push(indexed);

                for (let j = 0; j <= tokens.length - 1; j++) {
                    const token = tokens[j].trim();
                    const firstChar = token[0];
            
                    /**
                     * Cache the first first character for quick lookup
                     */
                    if (!firstCharCache.has(firstChar)) {
                        firstCharCache.set(firstChar, [ indexed ]);
                    } else {
                        firstCharCache.get(firstChar)!.push(indexed);
                    }
                }
            }

            console.log("indexed!", patients, firstCharCache)
            return { requestId, result: sort(allPatients) }
        };
    };
};