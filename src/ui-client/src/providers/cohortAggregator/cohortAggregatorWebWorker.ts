/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { CohortMap, NetworkCohortState } from '../../models/state/CohortState';
import { BinarySplitPair, DemographicStatistics } from '../../models/cohort/DemographicDTO';
import { NetworkResponderMap } from '../../models/NetworkResponder';
import { workerContext } from './cohortAggregatorWebWorkerContext';
import { PatientListDatasetDTO } from '../../models/patientList/Dataset';
import { PatientId } from '../../models/patientList/Patient';
import { PatientListColumnType } from '../../models/patientList/Column';

const AGGREGATE_STATISTICS = 'AGGREGATE_STATISTICS';
const COMBINE_DATASETS = 'COMBINE_DATASETS';

const typeString = PatientListColumnType.String;
const typeNum = PatientListColumnType.Numeric;
const typeDate = PatientListColumnType.DateTime;

interface InboundMessagePartialPayload {
    cohorts?: CohortMap;
    message: string;
    responders?: NetworkResponderMap;
    visualizationData?: Map<string, PatientListDatasetDTO[]>;
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
            ${this.addMessageTypesToContext([ AGGREGATE_STATISTICS, COMBINE_DATASETS ])}
            var typeString = ${PatientListColumnType.String};
            var typeNum = ${PatientListColumnType.Numeric};
            var typeDate = ${PatientListColumnType.DateTime};
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

    public combineDatasets = (visualizationData: Map<string, PatientListDatasetDTO[]>) => {
        return this.postMessage({ message: COMBINE_DATASETS, visualizationData });
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
                case COMBINE_DATASETS:
                    return combineVisualizationDatasets(payload);
                default:
                    return null;
            }
        };

        const combineVisualizationDatasets = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { visualizationData, requestId } = payload;
            const combined: Map<string, any[]> = new Map();
            const defaultPersonId = 'PersonId';
            const loweredPersonId = 'personId';
            
            visualizationData.forEach((dsarr, dsid) => {
                const union: any[] = []
                for (const ds of dsarr) {
                    const uniquePatients: PatientId[] = Object.keys(ds.results);
                    for (let i = 0; i < uniquePatients.length; i++) {
                        const p = uniquePatients![i];
                        const rows = ds.results[p];
                        for (const row of rows) {
                            const d = row as any;
                            if (d[defaultPersonId]) {
                                d[loweredPersonId] = d[defaultPersonId];
                                delete d[defaultPersonId];
                            }
                            union.push(d);
                        }
                    }
                }
                combined.set(dsid, union);
            });

            return { requestId, result: combined };
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
                    Object.keys(prevBucket).forEach((gk: string) => {
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
                Object.keys(curr.religionData).forEach((k: string) => {
                    const currBucket = curr.religionData[k] as any;
                    let prevBucket = prev.religionData[k] as any;

                    if (!prevBucket) {
                        prevBucket = Object.assign({}, currBucket);
                        prev.religionData[k] = prevBucket;
                    } else {
                        Object.keys(currBucket).forEach((sbk: string) => {
                            if (!prevBucket[sbk]) {
                                prevBucket[sbk] = 0;
                            }
                            prevBucket[sbk] += currBucket[sbk];
                        })
                    }
                });

                // NIH Race, Ethnicity, Gender
                Object.keys(curr.nihRaceEthnicityData).forEach((k: any) => {
                    const currBucket = curr.nihRaceEthnicityData[k] as any;
                    let prevBucket = prev.nihRaceEthnicityData[k as any] as any;

                    if (!prevBucket) {
                        prevBucket = Object.assign({}, currBucket);
                        prev.nihRaceEthnicityData[k] = prevBucket;
                    } else {
                        Object.keys(currBucket).forEach((eb: string) => {
                            if (!prevBucket[eb]) {
                                prevBucket[eb] = currBucket[eb];
                            } else {
                                Object.keys(currBucket[eb]).forEach((hispType: string) => {
                                    Object.keys(currBucket[eb][hispType]).forEach((genderType: string) =>{
                                        prevBucket[eb][hispType][genderType] += currBucket[eb][hispType][genderType];
                                    });
                                });
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