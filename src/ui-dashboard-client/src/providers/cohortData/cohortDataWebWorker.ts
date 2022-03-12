/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { PatientListDatasetDTO, PatientListDatasetQueryDTO } from '../../models/patientList/Dataset';
//import { workerContext } from './cohortDataWebWorkerContext';
import { personId, encounterId } from '../../models/patientList/DatasetDefinitionTemplate';
import { PatientListColumnType } from '../../models/patientList/Column';
import { DemographicRow } from '../../models/cohortData/DemographicDTO';
import { CohortData, DatasetMetadata } from '../../models/state/CohortState';

const TRANSFORM = 'TRANSFORM';

const typeString = PatientListColumnType.String;
const typeNum = PatientListColumnType.Numeric;
const typeDate = PatientListColumnType.DateTime;
const typeSparkline = PatientListColumnType.Sparkline;

interface InboundMessagePartialPayload {
    data?: [PatientListDatasetQueryDTO, PatientListDatasetDTO];
    demographics?: DemographicRow[];
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
            ${this.addMessageTypesToContext([ TRANSFORM ])}
            var typeString = ${PatientListColumnType.String};
            var typeNum = ${PatientListColumnType.Numeric};
            var typeDate = ${PatientListColumnType.DateTime};
            var typeSparkline = ${PatientListColumnType.Sparkline};
            var personId = '${personId}';
            var encounterId = '${encounterId}';
            //${this.stripFunctionToContext(this.workerContext)}
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
                default:
                    return null;
            }
        };

        const transform = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { data, demographics, requestId } = payload;
            const result: CohortData = { patients: new Map(), metadata: new Map() };

            for (const row of demographics!) {
                result.patients.set(row.personId, { demographics: row, datasets: new Map() });
            };

            for (const pair of data!) {
                const [ dsRef, dataset ] = pair as any;
                const meta: DatasetMetadata = { ref: dsRef, schema: dataset.schema };
                const dateFields = dataset.schema.fields.filter((field: any) => field.type === typeDate).map((field: any) => field.name);

                for (const patientId of Object.keys(dataset.results)) {
                    const rows = dataset.results[patientId];
                    let patient = result.patients.get(patientId)!;

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
                    rows.sort(((a: any, b: any) => a[dsRef.dateValueColumn!] - b[dsRef.dateValueColumn!]));
                    patient.datasets.set(dsRef.id, rows);
                    result.patients.set(patientId, patient);
                    result.metadata.set(dsRef.id, meta);
                }
            }

            return { result, requestId };
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

