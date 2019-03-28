/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { CohortMap, NetworkCohortState } from '../../models/state/CohortState';
import { AgeByGenderBucket, BinarySplitPair, DemographicStatistics } from '../../models/cohort/DemographicDTO';
import { NetworkRespondentMap } from '../../models/NetworkRespondent';
import { workerContext } from './cohortAggregatorWebWorkerContext';

const AGGREGATE_STATISTICS = 'AGGREGATE_STATISTICS';

interface InboundMessagePartialPayload {
    cohorts?: CohortMap;
    message: string;
    respondents?: NetworkRespondentMap;
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

    public aggregateStatistics = (cohorts: CohortMap, respondents: NetworkRespondentMap) => {
        return this.postMessage({ message: AGGREGATE_STATISTICS, cohorts, respondents });
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
                case AGGREGATE_STATISTICS:
                    return aggregateStatistics(payload);
                default:
                    return null;
            }
        };

        const aggregateStatistics = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { cohorts, respondents, requestId } = payload;
            const preAgg: DemographicStatistics[] = [];
            cohorts!.forEach((c: NetworkCohortState) => {
                if (respondents!.get(c.id)!.enabled && c.visualization && c.visualization.demographics) {
                    preAgg.push(c.visualization.demographics);
                }
            });

            const aggregate = preAgg.reduce((agg: DemographicStatistics, target: DemographicStatistics) => {

                // For all age by gender buckets (eg, 35-44, 45-54, 55-64)
                Object.keys(agg.ageByGenderData.buckets).forEach((bucketKey: any) => {
                    const aggBucket: AgeByGenderBucket = agg.ageByGenderData.buckets[bucketKey];
                    const targetBucket: AgeByGenderBucket = target.ageByGenderData.buckets[bucketKey];

                    // For all gender identifications, sum
                    Object.keys(aggBucket).forEach((genderKey: any) => {
                        aggBucket[genderKey] += targetBucket[genderKey];
                    })
                });
                
                // Binary splits are in arrays which should always be in the same order, but
                // match up by category strings to be safe
                agg.binarySplitData.forEach((v: BinarySplitPair) => {
                    const t = target.binarySplitData.find((x: BinarySplitPair) => x.category === v.category);
                    if (t) {
                        v.left.value += t.left.value;
                        v.right.value += t.right.value;
                    }
                });
                return agg;
            })

            return { requestId, result: aggregate };
        }
    }
}