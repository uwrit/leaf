/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { PatientListDatasetDTO, PatientListDatasetQueryDTO } from '../../models/patientList/Dataset';
import { workerContext } from './cohortDataWebWorkerContext';
import { personId, encounterId } from '../../models/patientList/DatasetDefinitionTemplate';
import { PatientListColumnType } from '../../models/patientList/Column';
import { DemographicRow } from '../../models/cohortData/DemographicDTO';
import { CohortComparisonResult, CohortData, DatasetMetadata, PatientData } from '../../models/state/CohortState';
import { StringPickerOption, WidgetTimelineComparisonEntryConfig } from '../../models/config/content';
import { TimelineValueSet } from '../../components/Dynamic/Timeline/Timeline';
import { PatientListRow } from '../../models/patientList/Patient';

const TRANSFORM = 'TRANSFORM';
const GET_COHORT_MEAN = 'GET_COHORT_MEAN';

const typeString = PatientListColumnType.String;
const typeNum = PatientListColumnType.Numeric;
const typeDate = PatientListColumnType.DateTime;
const typeSparkline = PatientListColumnType.Sparkline;

interface InboundMessagePartialPayload {
    data?: [PatientListDatasetQueryDTO, PatientListDatasetDTO];
    filters?: WidgetTimelineComparisonEntryConfig[];
    dimensions?: TimelineValueSet[];
    demographics?: DemographicRow[];
    sourcePatId?: string;
    message: string;
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

export default class CohortDataWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([ TRANSFORM, GET_COHORT_MEAN ])}
            var typeString = ${PatientListColumnType.String};
            var typeNum = ${PatientListColumnType.Numeric};
            var typeDate = ${PatientListColumnType.DateTime};
            var typeSparkline = ${PatientListColumnType.Sparkline};
            var personId = '${personId}';
            var encounterId = '${encounterId}';
            ${this.stripFunctionToContext(this.workerContext)}
            self.onmessage = function(e) {  
                self.postMessage(handleWorkMessage.call(this, e.data, postMessage)); 
            }`;
        // console.log(workerFile);
        const blob = new Blob([workerFile], { type: 'text/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        this.worker.onmessage = result => this.handleReturnPayload(result);
        this.worker.onerror = error => this.reject(error);
    }

    public transform = (data: [PatientListDatasetQueryDTO, PatientListDatasetDTO], demographics: DemographicRow[]) => {
        return this.postMessage({ message: TRANSFORM, data, demographics });
    }

    public getCohortMean = (filters: WidgetTimelineComparisonEntryConfig[], dimensions: TimelineValueSet[], sourcePatId: string) => {
        return this.postMessage({ message: GET_COHORT_MEAN, filters, dimensions, sourcePatId });
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

        // eslint-disable-next-line
        const handleWorkMessage = (payload: InboundMessagePayload) => {
            switch (payload.message) {
                case TRANSFORM:
                    return transform(payload);
                case GET_COHORT_MEAN:
                    return getCohortMean(payload);
                default:
                    return null;
            }
        };

        let cohortData: CohortData = { patients: new Map(), metadata: new Map(), comparison: { values: new Map(), n: 0 } };
        let datasets: Map<string, [PatientListDatasetQueryDTO, PatientListDatasetDTO]>;

        const getCohortMean = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { filters, dimensions, sourcePatId, requestId } = payload;
            const result: CohortComparisonResult = { values: new Map(), n: 0 };
            const matches = getMatchingPatients(filters!, sourcePatId!);
            result.n = matches.length;
            console.log(matches);

            for (const dim of dimensions!) {
                const mean = getMeanValue(matches, dim);
                result.values.set(dim.ds.id, mean);
            }

            return { result, requestId };
        };

        const getDatasetFrequencies = (filter: WidgetTimelineComparisonEntryConfig, data: PatientListDatasetDTO): StringPickerOption[] => {
            const output: StringPickerOption[] = [];
            const count: Map<string, Set<string>> = new Map();
            const display: Map<string, string> = new Map();

            for (const pat of cohortData.patients.values()) {
                const ds = pat.datasets.get(filter.datasetId);
                if (!ds) continue;
                for (const row of ds) {
                    
                }
            }
            return output;
        };

        const getMeanValue = (patIds: string[], dim: TimelineValueSet): number => {
            let n = 0;
            let sum = 0.0;
            for (const p of patIds) {
                const d = cohortData.patients.get(p)!;
                const ds = d.datasets.get(dim.ds.id);
                if (ds) {
                    const vals = ds.filter(x => x[dim.cols.fieldValueNumeric!]);
                    if (vals.length) {
                        n++;
                        sum += vals[vals.length-1][dim.cols.fieldValueNumeric!] as any;
                    }
                }
            }

            return sum / n;
        };

        const getMatchingPatients = (filters: WidgetTimelineComparisonEntryConfig[], sourcePatId: string): string[] => {
            const elig = new Map(cohortData.patients);
            const sourcePat = cohortData.patients.get(sourcePatId);
            const all = () => [ ...cohortData.patients.keys() ];
            let matcher: (pat: PatientData) => boolean;

            if (!sourcePat) return all();
            for (const filter of filters) {
                if (!filter.enabled) {
                    continue;
                }
                
                // Check dataset
                if (filter.datasetId === "demographics") {
                    const numCols = new Set([ 'age', ])
                    matcher = (numCols.has(filter.column)
                        ? matchNum : matchString)(filter, sourcePat);
                    
                } else {
                    const ds = datasets.get(filter.datasetId);
                    if (!ds) return all();

                    // Check column
                    const col = ds[1].schema.fields.find(f => f.name === filter.column);
                    if (!col) return all();

                    // Get matching func
                    matcher = (col.type === typeNum
                        ? matchNum : matchString)(filter, sourcePat);
                }

                // Check each patient
                for (const pat of elig) {
                    const matched = matcher(pat[1]);
                    if (!matched) {
                        elig.delete(pat[0]);
                    }
                }
            }

            return [ ...elig.keys() ];
        };

        const matchString = (filter: WidgetTimelineComparisonEntryConfig, sourcePat: PatientData) => {
            const defaultMatchFunc = (pat: PatientData) => true;
            let matchOn = new Set();
            let matchUnq = 1;

            if (filter.args && filter.args.string && filter.args.string.matchOn && filter.args.string.matchOn.length > 0) {
                matchOn = new Set(filter.args.string.matchOn);
                matchUnq = matchOn.size;
            } else {
                const ds = sourcePat.datasets.get(filter.datasetId);
                if (!ds) return defaultMatchFunc;

                const val = ds.find(r => r[filter.column]);
                if (!val) return defaultMatchFunc;

                matchOn = new Set([ val[filter.column] ]);
            }

            return (pat: PatientData): boolean => {
                const ds = pat.datasets.get(filter.datasetId);
                if (!ds) return false;

                const vals = ds.filter(r => matchOn.has(r[filter.column])).map(r => r[filter.column]);
                if (vals.length === 0) return false;

                const unq = new Set(vals).size;
                if (unq === matchUnq) return true;
                return false;
            }
        };

        const matchNum = (filter: WidgetTimelineComparisonEntryConfig, sourcePat: PatientData) => {
            const defaultMatchFunc = (pat: PatientData) => true;

            const ds = sourcePat.datasets.get(filter.datasetId);
            if (!ds) return defaultMatchFunc;

            const val = ds.find(r => r[filter.column]);
            if (!val) return defaultMatchFunc;

            let boundLow = val[filter.column] as any;
            let boundHigh = boundLow;

            if (filter.args && filter.args.numeric && filter.args.numeric.pad) {
                boundLow -= filter.args.numeric.pad;
                boundHigh += filter.args.numeric.pad;
            }

            return (pat: PatientData): boolean => {
                const ds = pat.datasets.get(filter.datasetId);
                if (!ds) return false;

                const val = ds.find(r => r[filter.column] as any >= boundLow && r[filter.column] as any <= boundHigh);
                if (!val) return false;
                return true;
            }
        };

        const transform = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { data, demographics, requestId } = payload;
            cohortData = { patients: new Map(), metadata: new Map(), comparison: { values: new Map(), n: 0 } };
            datasets = new Map();

            for (const row of demographics!) {
                cohortData.patients.set(row.personId, { id: row.personId, demographics: row, datasets: new Map() });
            };

            for (const pair of data!) {
                const [ dsRef, dataset ] = pair as any;
                const meta: DatasetMetadata = { ref: dsRef, schema: dataset.schema };
                const dateFields = dataset.schema.fields.filter((field: any) => field.type === typeDate).map((field: any) => field.name);
                datasets.set(dsRef.id, [ dsRef, dataset ]);

                for (const patientId of Object.keys(dataset.results)) {
                    let rows = dataset.results[patientId];
                    let patient = cohortData.patients.get(patientId)!;

                    // Convert strings to dates
                    for (let j = 0; j < rows.length; j++) {
                        const row = rows[j] as any;
                        for (let k = 0; k < dateFields.length; k++) {
                            const f = dateFields[k];
                            const v = row[f];
                            if (v) {
                                row[f] = parseTimestamp(v);
                                row.__dateunix__ = row[f].valueOf();
                            }
                        }
                    }
                    rows = rows.sort(((a: any, b: any) => a.__dateunix__ - b.__dateunix__));
                    patient.id = patientId;
                    patient.datasets.set(dsRef.id, rows);
                    patient.datasets.set("demographics", ([ patient.demographics ] as any) as PatientListRow[]);
                    cohortData.patients.set(patientId, patient);
                    cohortData.metadata.set(dsRef.id, meta);
                }
            }

            return { result: cohortData, requestId };
        }

        /**
         * Parse a string timestamp. More info at https://github.com/uwrit/leaf/issues/418
         */
         const parseTimestamp = (timestampStr: string): Date => {
            const _date = new Date(timestampStr);
            return new Date(_date.getTime() + (_date.getTimezoneOffset() * 60 * 1000));
        };
    }
}

