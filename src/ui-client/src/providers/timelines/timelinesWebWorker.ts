/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { config } from 'process';
import { generate as generateId } from 'shortid';
import { ConceptDatasetDTO, ConceptDatasetRow } from '../../models/cohort/ConceptDataset';
import { Concept, ConceptId } from '../../models/concept/Concept';
import { PatientId } from '../../models/patientList/Patient';
import { DateDisplayMode, DateIncrementType, TimelinesConfiguration, TimelinesDisplayMode } from '../../models/timelines/Configuration';
import { TimelinesAggregateDataRow, TimelinesAggregateDataset, TimelinesAggregateTimeBin } from '../../models/timelines/Data';
import { IndexPatient } from '../../models/timelines/Patient';
import { ConceptDatasetStore, IndexDatasetStore } from '../../models/timelines/Patient';
import { workerContext } from './timelinesWebWorkerContext';

const ADD_CONCEPT_DATASET = 'ADD_CONCEPT_DATASET';
const ADD_INDEX_DATASET = 'ADD_INDEX_DATASET';
const REMOVE_CONCEPT_DATASET = 'REMOVE_CONCEPT_DATASET';
const CLEAR_DATA = 'CLEAR_DATA';
const QUERY = 'QUERY';

const configQueryAggregate = TimelinesDisplayMode.AGGREGATE;
const configQueryPatient = TimelinesDisplayMode.PATIENT;
const dateDisplayModeAfter = DateDisplayMode.AFTER;
const dateDisplayModeBefore = DateDisplayMode.BEFORE;
const dateDisplayModeBeforeAfter = DateDisplayMode.BEFORE_AND_AFTER;
const dateIncrementDay = DateIncrementType.DAY;
const dateIncrementHour = DateIncrementType.HOUR;
const dateIncrementMinute = DateIncrementType.MINUTE;
const dateIncrementWeek = DateIncrementType.WEEK;
const dateIncrementMonth = DateIncrementType.MONTH;
const dateIncrementYear = DateIncrementType.YEAR;

interface InboundMessagePartialPayload {
    concept?: Concept;
    config?: TimelinesConfiguration;
    dataset?: ConceptDatasetDTO;
    message: string;
    responderId?: number;
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

export default class TimelinesWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([ ADD_CONCEPT_DATASET, ADD_INDEX_DATASET, REMOVE_CONCEPT_DATASET, CLEAR_DATA, QUERY ])}
            var configQueryAggregate = ${TimelinesDisplayMode.AGGREGATE};
            var configQueryPatient = ${TimelinesDisplayMode.PATIENT};
            var dateDisplayModeAfter = ${DateDisplayMode.AFTER};
            var dateDisplayModeBefore = ${DateDisplayMode.BEFORE};
            var dateDisplayModeBeforeAfter = ${DateDisplayMode.BEFORE_AND_AFTER};
            var dateIncrementDay = ${DateIncrementType.DAY};
            var dateIncrementHour = ${DateIncrementType.HOUR};
            var dateIncrementMinute = ${DateIncrementType.MINUTE};
            var dateIncrementWeek = ${DateIncrementType.WEEK};
            var dateIncrementMonth = ${DateIncrementType.MONTH};
            var dateIncrementYear = ${DateIncrementType.YEAR};
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

    public addConceptDataset = (dataset: ConceptDatasetDTO, responderId: number, concept: Concept) => {
        return this.postMessage({ message: ADD_CONCEPT_DATASET, dataset, responderId, concept });
    }

    public addIndexDataset = (dataset: ConceptDatasetDTO, responderId: number) => {
        return this.postMessage({ message: ADD_INDEX_DATASET, dataset, responderId });
    }

    public removeConceptDataset = (config: TimelinesConfiguration, concept: Concept) => {
        return this.postMessage({ message: REMOVE_CONCEPT_DATASET, config, concept})
    }

    public query = (config: TimelinesConfiguration) => {
        return this.postMessage({ message: QUERY, config });
    }

    public clear = () => {
        return this.postMessage({ message: CLEAR_DATA });
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
        let indexDataset: IndexDatasetStore = { patients: new Map<PatientId, IndexPatient>() };
        let conceptDatasetMap = new Map<ConceptId, ConceptDatasetStore>();

        // eslint-disable-next-line
        const handleWorkMessage = (payload: InboundMessagePayload) => {
            switch (payload.message) {
                case QUERY:
                    return query(payload);
                case ADD_CONCEPT_DATASET:
                    return addConceptDataset(payload);
                case ADD_INDEX_DATASET:
                    return addIndexDataset(payload);
                case REMOVE_CONCEPT_DATASET:
                    return removeConceptDataset(payload);
                case CLEAR_DATA:
                    return clearData(payload);
                default:
                    return null;
            }
        };

        const query = (payload: InboundMessagePayload) => {
            if (payload.config!.mode === configQueryAggregate) {
                return { requestId: payload.requestId, result: queryAggregate(payload) };
            } else {
                return null;
            }
        };

        /**
         * Query aggregate
         */
        const queryAggregate = (payload: InboundMessagePayload): TimelinesAggregateDataset => {
            const config = payload.config!;
            const output: TimelinesAggregateDataset = { concepts: new Map() };
            const bins = getTimeBins(config);
            const dateDiffer = getDateDiffFunc(config);
            const totalPats = indexDataset.patients.size;

            if (totalPats === 0) { return output; }
            
            // Foreach concept
            conceptDatasetMap.forEach((v,k) => {
                const data = getAggregateCounts(totalPats, config, v.concept, bins, dateDiffer);
                output.concepts.set(k, { concept: v.concept, data });
            });

            return output;
        };

        /**
         * Aggregate counts relative to index date
         */
        const getAggregateCounts = (
            totalPats: number,
            config: TimelinesConfiguration,
            concept: Concept, 
            bins: TimelinesAggregateTimeBin[], 
            dateDiffer: (d1: Date, d2: Date) => number): TimelinesAggregateDataRow[] => {

            const output: TimelinesAggregateDataRow[] = [];
            const conceptData = conceptDatasetMap.get(concept.id);
            if (!conceptData) { return output; }

            const pats = [ ...conceptData.patients.values() ];

            // For each bin
            bins.forEach((bin) => {
                let binCount = 0;

                // For each patient
                for (let i = 0; i < pats.length; i++) {
                    const p = pats[i];
                    const idxp = indexDataset.patients.get(p.compoundId);
                    if (!idxp || !idxp.initialDate) { continue; }

                    const indexDate = idxp.initialDate;
                    let d;

                    if (typeof(bin.minNum) === 'undefined') {
                        d = p.rows.find((r) => r.dateField && dateDiffer(r.dateField, indexDate) < bin.maxNum!);
                    } else if (typeof(bin.maxNum) === 'undefined') {
                        d = p.rows.find((r) => r.dateField && dateDiffer(r.dateField, indexDate) > bin.minNum!);
                    } else {
                        d = p.rows.find((r) => {
                            if (!r.dateField) { return false; }
                            const diff = dateDiffer(r.dateField, indexDate);
                            if (diff >= bin.minNum! && diff < bin.maxNum!) {
                                return true;
                            }
                            return false;
                        });
                    }
                    if (d) {
                        binCount += 1;
                    }
                }
                const values = { percent: (binCount / totalPats), total: binCount };
                const dataRow: TimelinesAggregateDataRow = {
                    conceptId: concept.id,
                    timepointId: bin.label,
                    displayValueX: values.total,
                    displayValueY: 1,
                    values
                };
                output.push(dataRow);
            });

            // Add index date bin
            const indexDate = {
                conceptId: concept.id, timepointId: 'Index Event',
                displayValueX: 0, displayValueY: 1,
                values: { percent: 0, total: 0 }
            };
            if (config.dateIncrement.mode === dateDisplayModeBefore) {
                output.push(indexDate);
            } else if (config.dateIncrement.mode === dateDisplayModeAfter) {
                output.unshift(indexDate);
            }

            return output;
        };

        /**
         * Get datediff function
         */
        const getDateDiffFunc = (config: TimelinesConfiguration): any => {
            const type = config.dateIncrement.incrementType
            let divider = 1000;

            switch (type) {
                case dateIncrementMinute: divider = (1000*60); break;
                case dateIncrementHour:   divider = (1000*60*60); break;
                case dateIncrementDay:    divider = (1000*60*60*24); break;
                case dateIncrementWeek:   divider = (1000*60*60*24*7); break;
                case dateIncrementMonth:  divider = (1000*60*60*24*30); break;
                case dateIncrementYear:   divider = (1000*60*60*24*365); break;
            }
            return (rowDate: Date, initialDate: Date) => ((rowDate.getTime() - initialDate.getTime()) / divider);
        };

        /**
         * Get Timebins
         */
        const getTimeBins = (config: TimelinesConfiguration): TimelinesAggregateTimeBin[] => {
            const maxBins = 5;
            const bins: TimelinesAggregateTimeBin[] = [];
            const incr = config.dateIncrement.increment;
            let startBin;
            let lastBin;
            let lowerBound = 0;
            let upperBound = 0;
            let currIdx = incr;

            // Bail if increment invalid
            if (config.dateIncrement.increment <= 0 || isNaN(config.dateIncrement.increment)) {
                return bins;
            }

            // After
            if (config.dateIncrement.mode === dateDisplayModeAfter) {
                lowerBound = 0;
                upperBound = incr * maxBins;
                startBin = { label: `<${incr}`, minNum: 0.0001, maxNum: incr };
                lastBin  = { label: `>${upperBound}`, minNum: upperBound };

                while (currIdx < upperBound) {
                    bins.push({ label: `${currIdx}-${Math.abs(currIdx+incr)}`, minNum: currIdx, maxNum: currIdx+incr });
                    currIdx += incr;
                }
                bins.unshift(startBin);
                bins.push(lastBin);
            }

            // Before
            else if (config.dateIncrement.mode === dateDisplayModeBefore) {
                upperBound = 0;
                lowerBound = -(incr * maxBins);
                currIdx = -incr;
                startBin = { label: `>${Math.abs(lowerBound)}`, maxNum: lowerBound };

                while (currIdx >= lowerBound) {
                    bins.unshift({ label: `${Math.abs(currIdx+incr)}-${Math.abs(currIdx)}`, minNum: currIdx, maxNum: currIdx+incr });
                    currIdx -= incr;
                }
                bins.unshift(startBin);
            }
            
            return bins;
        };

        /**
         * Clear all data
         */
        const clearData = (payload: InboundMessagePayload) => {
            conceptDatasetMap = new Map<ConceptId, ConceptDatasetStore>();
            indexDataset = { patients: new Map<PatientId, IndexPatient>() };
            return { requestId: payload.requestId };
        };

        /**
         * Remove concept dataset
         */
        const removeConceptDataset = (payload: InboundMessagePayload) => {
            const concept = payload.concept!;
            conceptDatasetMap.delete(concept.id);
            return { requestId: payload.requestId };
        };

        /**
         *  Add concept dataset
         */
        const addConceptDataset = (payload: InboundMessagePayload) => {
            const responderId = payload.responderId!;
            const dataset = payload.dataset!;
            const concept = payload.concept!;
            const uniquePatients: PatientId[] = Object.keys(dataset.results);
            let store;

            if (!conceptDatasetMap.has(concept.id)) {
                store = {
                    concept,
                    patients: new Map()
                };
                conceptDatasetMap.set(concept.id, store);
            } else {
                store = conceptDatasetMap.get(concept.id)!;
            }

            // For each row
            for (let i = 0; i < uniquePatients.length; i++) {
                const p = uniquePatients![i];
                const rows = dataset.results[p];
                const compoundId = `${responderId}_${p}`;

                // Convert to ConceptDatasetRow
                const convRows: ConceptDatasetRow[] = [];
                for (let k = 0; k < rows.length; k++) {
                    const row = rows[k];
                    const convRow: ConceptDatasetRow = { 
                        ...row, 
                        dateField: row.dateField ? new Date(row.dateField) : undefined
                    };
                    convRows.push(convRow);
                }

                const pat = { compoundId, id: p, responderId, rows: convRows };
                store.patients.set(compoundId, pat);
            }

            return { requestId: payload.requestId };
        };

        /**
         *  Add index dataset
         */
        const addIndexDataset = (payload: InboundMessagePayload) => {
            const responderId = payload.responderId!;
            const dataset = payload.dataset!;
            const uniquePatients: PatientId[] = Object.keys(dataset.results);

            // For each row
            for (let i = 0; i < uniquePatients.length; i++) {
                const p = uniquePatients![i];
                const rows = dataset.results[p];
                const compoundId = `${responderId}_${p}`;

                // Convert to ConceptDatasetRow
                const convRows: ConceptDatasetRow[] = [];
                let initialDate;
                let finalDate;
                for (let k = 0; k < rows.length; k++) {
                    const row = rows[k];
                    const convRow: ConceptDatasetRow = { 
                        ...row, 
                        dateField: row.dateField ? new Date(row.dateField) : undefined
                    };
                    if (convRow.dateField) {
                        if (!initialDate || convRow.dateField < initialDate) {
                            initialDate = convRow.dateField;
                        }
                        if (!finalDate || convRow.dateField > finalDate) {
                            finalDate = convRow.dateField;
                        }
                    }
                    convRows.push(convRow);
                }

                const pat: IndexPatient = { compoundId, id: p, responderId, rows: convRows, initialDate, finalDate };
                indexDataset.patients.set(compoundId, pat);
            }
            return { requestId: payload.requestId };
        };
    }
}

