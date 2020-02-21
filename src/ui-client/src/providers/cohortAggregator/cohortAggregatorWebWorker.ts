/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { CohortMap, NetworkCohortState } from '../../models/state/CohortState';
import { AgeByGenderBucket, BinarySplitPair, DemographicStatistics } from '../../models/cohort/DemographicDTO';
import { NetworkResponderMap } from '../../models/NetworkResponder';
import { workerContext } from './cohortAggregatorWebWorkerContext';

const AGGREGATE_STATISTICS = 'AGGREGATE_STATISTICS';

interface InboundMessagePartialPayload {
    cohorts?: CohortMap;
    message: string;
    responders?: NetworkResponderMap;
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

export default class CohortAggregatorWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([ AGGREGATE_STATISTICS ])}
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

    public aggregateStatistics = (cohorts: CohortMap, responders: NetworkResponderMap) => {
        return this.postMessage({ message: AGGREGATE_STATISTICS, cohorts, responders });
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
                case AGGREGATE_STATISTICS:
                    return aggregateStatistics(payload);
                default:
                    return null;
            }
        };

        const aggregateStatistics = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { cohorts, responders, requestId } = payload;
            const preAgg: DemographicStatistics[] = [];
            cohorts!.forEach((c: NetworkCohortState) => {
                if (responders!.get(c.id)!.enabled && c.visualization && c.visualization.demographics) {
                    preAgg.push(c.visualization.demographics);
                }
            });

            const aggregate = preAgg.reduce((prev: DemographicStatistics, curr: DemographicStatistics) => {

                // For all age by gender buckets (eg, 35-44, 45-54, 55-64)
                Object.keys(prev.ageByGenderData.buckets).forEach((k: string) => {
                    const prevBucket = prev.ageByGenderData.buckets[k];
                    const currBucket = curr.ageByGenderData.buckets[k];

                    // For all gender identifications, sum
                    Object.keys(prevBucket).forEach((gk: any) => {
                        prevBucket[gk] += currBucket[gk];
                    })
                });
                
                // Binary splits are in arrays which should always be in the same order, but
                // match up by category strings to be safe
                prev.binarySplitData.forEach((v: BinarySplitPair) => {
                    const t = curr.binarySplitData.find((x: BinarySplitPair) => x.category === v.category);
                    if (t) {
                        v.left.value += t.left.value;
                        v.right.value += t.right.value;
                    }
                });

                // Language by heritage
                Object.keys(curr.languageByHeritageData.data.buckets).forEach((k: string) => {
                    const currBucket = curr.languageByHeritageData.data.buckets[k];
                    let prevBucket = prev.languageByHeritageData.data.buckets[k];

                    if (!prevBucket) {
                        prevBucket = Object.assign({}, currBucket);
                        prev.languageByHeritageData.data.buckets[k] = prevBucket;
                    } else {
                        Object.keys(currBucket.subBuckets).forEach((sbk: string) => {
                            if (prevBucket.subBuckets[sbk]) {
                                prevBucket.subBuckets[sbk] += currBucket.subBuckets[sbk];
                            }
                        })
                    }
                });

                // Religion
                Object.keys(curr.religionData.data.buckets).forEach((k: string) => {
                    const currBucket = curr.religionData.data.buckets[k];
                    let prevBucket = prev.religionData.data.buckets[k];

                    if (!prevBucket) {
                        prevBucket = Object.assign({}, currBucket);
                        prev.religionData.data.buckets[k] = prevBucket;
                    } else {
                        Object.keys(currBucket.subBuckets).forEach((sbk: string) => {
                            if (prevBucket.subBuckets[sbk]) {
                                prevBucket.subBuckets[sbk] += currBucket.subBuckets[sbk];
                            }
                        })
                    }
                });

                return prev;
            })

            return { requestId, result: aggregate };
        }
    }
}