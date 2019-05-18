/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { PatientListColumnType, PatientListColumnId, PatientListColumn, ValueByColumnKey, XY } from '../../models/patientList/Column';
import { PatientListConfiguration, PatientListSort } from '../../models/patientList/Configuration';
import { PatientListDataset, PatientListDatasetDefinition, PatientListDatasetId, PatientListDatasetDefinitionTemplate, PatientListDatasetExport } from '../../models/patientList/Dataset';
import { PatientListRowDTO, Patient, PatientId, PatientListRow, PatientListDetailEncounterRow, EncounterId } from '../../models/patientList/Patient';
import { workerContext } from './patientListWebWorkerContext';

const ADD_DEMOGRAPHICS = 'ADD_DEMOGRAPHICS';
const ADD_DATASET = 'ADD_DATASET';
const REMOVE_DATASET = 'REMOVE_DATASET';
const GET_PATIENTS = 'GET_PATIENTS';
const GET_SINGLETON_CSV = 'GET_SINGLETON_CSV';
const GET_MULTIROW_CSV = 'GET_MULTIROW_CSV';
const GET_ALL_DATA = 'GET_ALL_DATA';
const CLEAR_PATIENTS = 'CLEAR_PATIENTS';

const typeString = PatientListColumnType.string;
const typeNum = PatientListColumnType.number;
const typeDate = PatientListColumnType.date;
const typeSparkline = PatientListColumnType.sparkline;

interface InboundMessagePartialPayload {
    config?: PatientListConfiguration;
    dataset?: PatientListDataset;
    datasetDefinition?: PatientListDatasetDefinition;
    datasetId?: PatientListDatasetId;
    message: string;
    demographics?: PatientListRowDTO[];
    responderId?: number;
    template?: PatientListDatasetDefinitionTemplate;
    useDisplayedColumnsOnly?: boolean;
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

interface DerivedColumnIdLookup {
    count: string;
    mostRecent: string;
    mostRecentDate: string;
    earliest: string;
    earliestDate: string;
}

interface DerivedNumericColumnIdLookup extends DerivedColumnIdLookup {
    trend: string;
    mean: string;
    median: string;
    min: string;
    max: string;
}

interface DerivedColumnLookup {
    lookup: DerivedColumnIdLookup;
    map: Map<PatientListColumnId, PatientListColumn>;
}

interface DerivedNumericColumnLookup {
    lookup: DerivedNumericColumnIdLookup;
    map: Map<PatientListColumnId, PatientListColumn>;
}

export default class PatientListWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([ ADD_DEMOGRAPHICS, ADD_DATASET, REMOVE_DATASET, CLEAR_PATIENTS, GET_PATIENTS, GET_SINGLETON_CSV, GET_MULTIROW_CSV, GET_ALL_DATA ])}
            ${workerContext}
            var typeString = ${PatientListColumnType.string};
            var typeNum = ${PatientListColumnType.number};
            var typeDate = ${PatientListColumnType.date};
            var typeSparkline = ${PatientListColumnType.sparkline};
            self.onmessage = function(e) {  
                self.postMessage(handleWorkMessage.call(this, e.data, postMessage)); 
            }`;
        // console.log(workerFile);
        const blob = new Blob([workerFile], { type: 'text/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        this.worker.onmessage = result => this.handleReturnPayload(result);
        this.worker.onerror = error => this.reject(error);
    }

    public addDemographics = (datasetDefinition: PatientListDatasetDefinition, demographics: PatientListRowDTO[], responderId: number) => {
        return this.postMessage({ message: ADD_DEMOGRAPHICS, datasetDefinition, demographics, responderId });
    }

    public addDataset = (dataset: PatientListDataset, responderId: number) => {
        return this.postMessage({ message: ADD_DATASET, dataset, responderId });
    }

    public removeDataset = (config: PatientListConfiguration, datasetId: PatientListDatasetId) => {
        return this.postMessage({ message: REMOVE_DATASET, config, datasetId})
    }

    public clearPatients = () => {
        return this.postMessage({ message: CLEAR_PATIENTS });
    }

    public getPatients = (config: PatientListConfiguration) => {
        return this.postMessage({ message: GET_PATIENTS, config });
    }

    public getSingletonCsv = (config: PatientListConfiguration, useDisplayedColumnsOnly: boolean) => {
        return this.postMessage({ message: GET_SINGLETON_CSV, config, useDisplayedColumnsOnly });
    }

    public getMultirowCsv = (datasetId: PatientListDatasetId) => {
        return this.postMessage({ message: GET_MULTIROW_CSV, datasetId });
    }

    public getAllData = (config: PatientListConfiguration,useDisplayedColumnsOnly: boolean) => {
        return this.postMessage({ message: GET_ALL_DATA, config, useDisplayedColumnsOnly });
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
        let patientMap = new Map<string, Patient>();
        let singletonDatasets = new Map<PatientListDatasetId, PatientListDatasetDefinition>();
        let multirowDatasets = new Map<PatientListDatasetId, PatientListDatasetDefinition>();
        let defaultPatientOrder: PatientId[] = [];
        let currentPatientOrder: PatientId[] = [];
        let currentSortType: number = 0;
        let currentSortColumn: string = '';

        const handleWorkMessage = (payload: InboundMessagePayload) => {
            switch (payload.message) {
                case ADD_DEMOGRAPHICS:
                    return addPatientRows(payload);
                case ADD_DATASET:
                    return addPatientRows(payload);
                case REMOVE_DATASET:
                    return removeDataset(payload);
                case CLEAR_PATIENTS:
                    return clearPatients(payload);
                case GET_PATIENTS:
                    return getPatients(payload);
                case GET_SINGLETON_CSV:
                    return getSingletonDataCsv(payload);
                case GET_MULTIROW_CSV:
                    return getMultirowDataCsv(payload);
                case GET_ALL_DATA:
                    return getAllData(payload);
                default:
                    return null;
            }
        };

        /*
         * Clear all datasets and patient data.
         */
        const clearPatients = (payload: InboundMessagePayload): OutboundMessagePayload => {
            patientMap = new Map<PatientId, Patient>();
            singletonDatasets = new Map<PatientListDatasetId, PatientListDatasetDefinition>();
            multirowDatasets = new Map<PatientListDatasetId, PatientListDatasetDefinition>();
            defaultPatientOrder = [];
            currentPatientOrder = [];
            return { requestId: payload.requestId };
        };

        /*
         * Removes a given dataset and any associated data,
         * returning an updated patient list.
         */
        const removeDataset = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { datasetId } = payload;
            singletonDatasets.delete(datasetId!);
            multirowDatasets.delete(datasetId!);
            patientMap.forEach((p: Patient) => {
                p.multirowData.delete(datasetId!);
                p.singletonData.delete(datasetId!);
                setDetailRows(p.compoundId)
            })
            return getPatients(payload);
        }

        /*
         * Add server-sent data to the cache. An additional derived
         * dataset definition *may* be sent back to the caller
         * if the payload is a multirow dataset with rows.
         */
        const addPatientRows = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { dataset, datasetDefinition, demographics, requestId } = payload;
            let result: any = null;

            if (demographics) {
                addDatasetDefinition(datasetDefinition!);
                addDemographics(payload);
            } else if (dataset) {

                // Add the multirow data. This returns a new Dataset Definition
                // for the summary statistics.
                addDatasetDefinition(dataset.definition);
                result = addMultiRowDataset(payload);
                addDatasetDefinition(result);
            }
            return { requestId, result };
        };

        /*
         * Add a dataset definition if not already present.
         */
        const addDatasetDefinition = (def: PatientListDatasetDefinition) => {
            const prop = def.multirow ? multirowDatasets : singletonDatasets;
            if (!prop.has(def.id)) {
                prop.set(def.id, def);
            }
        };

        /*
         * Add multirow dataset data to the cache.
         */
        const addMultiRowDataset = (payload: InboundMessagePayload): PatientListDatasetDefinition => {
            const { dataset, responderId } = payload;
            const def = dataset!.definition!;
            const dsId = def.id;
            const data = dataset!.data.results;
            const dateFields: PatientListColumn[] = [];
            const uniquePatients: PatientId[] = Object.keys(data);
            const uniqueCompoundPatients: PatientId[] = [];
            let rowCount = 0;
            def.columns.forEach((c: PatientListColumn) => {
                if (c.type === typeDate) {
                    dateFields.push(c);
                }
            });
            
            // For each row
            for (let i = 0; i < uniquePatients.length; i++) {
                const p = uniquePatients![i];
                const rows = data[p];
                const compoundId = `${responderId}_${p}`;
                const patientData = patientMap.get(compoundId)!.multirowData;
                uniqueCompoundPatients.push(compoundId);

                // Convert strings to dates
                for (let j = 0; j < rows.length; j++) {
                    const row = rows[j];
                    for (let k = 0; k < dateFields.length; k++) {
                        const f = dateFields[k].id;
                        const v = row[f];
                        if (v) {
                            row[f] = new Date(v);
                        }
                    }
                }

                if (!patientData.has(dsId)) {
                    patientData.set(dsId, rows);
                }
            }

            // Pre-sort all values for each unique patient now that they are grouped
            for (let i = 0; i < uniqueCompoundPatients.length; i++) {
                const pat = patientMap.get(uniqueCompoundPatients[i])!;
                const vals = pat.multirowData.get(dsId)!;
                
                if (vals) {
                    const valsSorted = vals.sort((a: any, b: any) => a[def.dateValueColumn!] - b[def.dateValueColumn!]);
                    pat.multirowData.set(dsId, valsSorted);
                    rowCount += vals.length;
                }
            }

            // Rows are added to the patient map, now compute stats for each patient
            const derivedDef = def.numericValueColumn
                ? deriveNumericSummaryFromDataset(def, uniqueCompoundPatients)
                : deriveNonNumericSummaryFromDataset(def, uniqueCompoundPatients);
            derivedDef.totalRows = rowCount;
            return derivedDef;
        };

        /*
         * Add initial base (basic demographics) dataset to the cache.
         */
        const addDemographics = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { datasetDefinition, demographics, responderId, requestId } = payload;

            if (!demographics!.length) { return { requestId }; }
            
            // For each patient
            for (let i = 0; i < demographics!.length; i++) {
                // Add compound and responder ids
                const patientDto = demographics![i]! as any;
                const patient: Patient = {
                    compoundId: `${responderId}_${patientDto.personId}`,
                    detailRowCount: 0,
                    detailValues: [],
                    id: patientDto.personId,
                    multirowData: new Map<PatientListDatasetId, PatientListRowDTO[]>(),
                    responderId: responderId!,
                    singletonData: new Map<PatientListDatasetId, ValueByColumnKey>()
                }

                // Add to the patId arrays
                defaultPatientOrder.push(patient.compoundId);
                currentPatientOrder.push(patient.compoundId);
    
                // Add the demographics data
                patient.singletonData.set(datasetDefinition!.id, new Map(Object.entries(patientDto)));
    
                // Add patient to map
                patientMap.set(patient.compoundId, patient);
            }
            return { requestId };
        };

        /*
         * Return an array of tabular patient data based
         * on provided configuration definition (the config is
         * basically a description of what is display in the UI).
         */
        const getPatients = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const config = payload.config!; 
            const { requestId } = payload;
            const NONE = 0;
            let newPats: PatientId[];

            // If no need to sort, go by the ingested order
            if (config.sort.sortType === NONE) {
                newPats = getUnsortedPatients(config);
            }
            // Else we need sorted
            else {
                if (config.sort.column!.id !== currentSortColumn) {
                    sortPatients(config);
                }
                else if (config.sort.column!.id === currentSortColumn && config.sort.sortType !== currentSortType) {
                    currentPatientOrder = currentPatientOrder.reverse();
                } 
                newPats = getSortedPatients(config);
            }
            copySortType(config.sort);
            return { requestId, result: patientIdsToListRow(config, newPats) };
        };

        /*
         * After a tabular-dataset is returned to the caller,
         * cache a copy of the sorting definition here in the worker.
         * That way, next time data is requested we can check if 
         * patients are already approprietly sorted and avoid needing
         * to reprocess.
         */
        const copySortType = (configSort: PatientListSort) => {
            if (!configSort.column) { return; }
            currentSortColumn = configSort.column!.id;
            currentSortType = configSort.sortType;
        };

        /*
         * Return the actual tabular array to caller, row by row, tuple by tuple.
         * If a patient doesn't have data for a given dataset/column, return undefined.
         */
        const patientIdsToListRow = (config: PatientListConfiguration, patIds: PatientId[]): PatientListRow[] => {
            const patList: PatientListRow[] = [];
            for (let i = 0; i < patIds.length; i++) {
                const pat = patientMap.get(patIds[i])!;
                const patListRow: PatientListRow = { 
                    compoundId: pat.compoundId, 
                    detailRowCount: pat.detailRowCount, 
                    detailValues: pat.detailValues,
                    isOpen: false,
                    responderId: pat.responderId, 
                    values: [] 
                };
                patListRow.values = config.displayColumns.map((col: PatientListColumn) =>  {
                    const ds = pat.singletonData.get(col.datasetId);
                    if (!ds) { return undefined; }
                    return ds.get(col.id);
                });
                patList.push(patListRow);
            }
            return patList;
        };

        /*
         * Order all multirow data from latest to earliest, grouping
         * by encounters. This will be visible when the user clicks
         * on a patient row to drill down.
         */
        const setDetailRows = (patId: PatientId) => {
            const pat = patientMap.get(patId)!;
            const allDetails: PatientListDetailEncounterRow[] = [];
            const encMap = new Map<string, PatientListDetailEncounterRow[]>();
            let rowCount = 0;

            // Get all encounter detail rows in an array
            pat.multirowData.forEach((vals: PatientListRowDTO[], key: PatientListDatasetId) => {
                const ds = multirowDatasets.get(key)!;
                const cols = Array.from(ds.columns.keys()).filter((v: string) => v !== 'personId' && v !== 'encounterId' && v !== ds.dateValueColumn);
                const hasEncounterIdCol = !!vals[0].encounterId;

                for (let i = 0; i < vals.length; i++) {
                    const val: any = vals[i];
                    if (val && val[ds.dateValueColumn!])
                    rowCount++;
                        allDetails.push({
                            columns: cols.map((k: string) => ({ key: k, value: val[k] })),
                            datasetName: ds.displayName,
                            date: val[ds.dateValueColumn!],
                            dateColumnName: ds.dateValueColumn!,
                            encounterId: hasEncounterIdCol ? val.encounterId : 'Unknown Encounter'
                        });
                }
            });
            const getTime = (date?: Date) => date ? date.getTime() : 0;
            const sorted: PatientListDetailEncounterRow[] = allDetails
                .sort((a: PatientListDetailEncounterRow, b: PatientListDetailEncounterRow) => getTime(b.date) - getTime(a.date));
            
            // Group details by encounterId
            for (let j = 0; j < sorted.length; j++) {
                const row = sorted[j];
                if (encMap.has(row.encounterId)) {
                    encMap.get(row.encounterId)!.push(row);
                }
                else {
                    encMap.set(row.encounterId, [ row ]);
                }
            }

            // Set the grouped encounter data rows as the patient's detail array
            pat.detailValues = [];
            encMap.forEach((v: PatientListDetailEncounterRow[], k: EncounterId) => pat.detailValues.push({ encounterId: k, rows: v }));
            pat.detailRowCount = rowCount;
        };

        /*
         * Return patient ids unsorted.
         */
        const getUnsortedPatients = (config: PatientListConfiguration): PatientId[] => {
            const offset = config.pageNumber * config.pageSize;
            const patIds = defaultPatientOrder.slice(offset, offset + config.pageSize);
            return patIds;
        };

        /*
         * Return patient ids sorted.
         */
        const getSortedPatients = (config: PatientListConfiguration): PatientId[] => {
            const offset = config.pageNumber * config.pageSize;
            const patIds = currentPatientOrder.slice(offset, offset + config.pageSize);
            return patIds;
        };

        /*
         * Sort the cached patient ids by a given column and sort order.
         */
        const sortPatients = (config: PatientListConfiguration) => {
            const { datasetId, id } = config.sort.column!;
            const ASC = 1;

            // Set the sort algorithm to sort ASC or DESC
            const sortAlgo = config.sort.sortType === ASC
                ? (p: any, p2: any) => (p.value < p2.value ? -1 : p.value > p2.value ? 1 : 0)
                : (p: any, p2: any) => (p2.value < p.value ? -1 : p2.value > p.value ? 1 : 0);
            
            // Derive an array from the map and sort by column and algorithm
            currentPatientOrder = Array.from(patientMap)
                .map((p: any) => {
                    const ds = p[1].singletonData.get(datasetId);
                    const value = ds ? ds.get(id) : null;
                    return {
                        id: p[1].compoundId, 
                        value: value ? value : 0
                    }
                })
                .sort(sortAlgo)
                .map((p: any) => p.id) as PatientId[];
        };

        /*
         * Define a derivedNumericColumns template for
         * storing summarized stats from numeric datasets.
         */
        const getDerivedNumericColumnsTemplate = () => {
            // tslint:disable
            return {
                trend: { id: 'Trend', isDisplayed: true, type: typeSparkline },
                count: { id: 'Count', isDisplayed: true, type: typeNum },
                mean: { id: 'Mean', type: typeNum },
                median: { id: 'Median', type: typeNum },
                min: { id: 'Min', type: typeNum },
                max: { id: 'Max', type: typeNum },
                mostRecent: { id: 'MostRecent', type: typeString },
                mostRecentDate: { id: 'MostRecentDate', type: typeDate },
                earliest: { id: 'Earliest', type: typeString },
                earliestDate: { id: 'EarliestDate', type: typeDate }
            };
            // tslint:enable
        };

        /*
         * Define a derivedNumericColumns template for
         * storing summarized stats from datasets.
         */
        const getDerivedNonNumericColumnsTemplate = () => {
            // tslint:disable
            return {
                count: { id: 'Count', isDisplayed: true, type: typeNum },
                mostRecent: { id: 'MostRecent', type: typeString },
                mostRecentDate: { id: 'MostRecentDate', type: typeDate },
                earliest: { id: 'Earliest', type: typeString },
                earliestDate: { id: 'EarliestDate', type: typeDate }
            };
            // tslint:enable
        };

        /*
         * Return a map and column id lookup object for
         * a given dataset definition.
         */
        const getNumericSummaryDatasetColums = (def: PatientListDatasetDefinition): DerivedNumericColumnLookup => {
            const caps = /([A-Z])/g;
            const firstToUpper = /^./;
            const camelCaseToUpperSpaced = (colName: string) => colName.replace(caps, ' $1').replace(firstToUpper, (col: string) => col.toUpperCase());
            const cols = Object.assign({}, getDerivedNumericColumnsTemplate());
            Array.from(Object.keys(cols)).forEach((k: string, i: number) => {
                const col = cols[k];
                col.index = i;
                col.displayName = `${def.displayName}${camelCaseToUpperSpaced(col.id)}`;
                col.id = `${def.displayName}_${col.id}`.toLowerCase().replace(' ','_');
                col.isDisplayed = col.isDisplayed || false;
                col.datasetId = def.id;
            });

            return {
                lookup: {
                    count: cols.count.id,
                    earliest: cols.earliest.id,
                    earliestDate: cols.earliestDate.id,
                    max: cols.max.id,
                    mean: cols.mean.id,
                    median: cols.median.id,
                    min: cols.min.id,
                    mostRecent: cols.mostRecent.id,
                    mostRecentDate: cols.mostRecentDate.id,
                    trend: cols.trend.id
                },
                map: new Map([
                    [cols.trend.id, cols.trend],
                    [cols.count.id, cols.count],
                    [cols.mean.id, cols.mean],
                    [cols.median.id, cols.median],
                    [cols.min.id, cols.min],
                    [cols.max.id, cols.max],
                    [cols.mostRecent.id, cols.mostRecent],
                    [cols.mostRecentDate.id, cols.mostRecentDate],
                    [cols.earliest.id, cols.earliest],
                    [cols.earliestDate.id, cols.earliestDate]
                ])
            } as DerivedNumericColumnLookup;
        };

        /*
         * Derive a summary numeric singleton dataset from 
         * a multirow numeric dataset. The new dataset definition
         * is returned to the caller, and rows are added to the cache.
         */
        const deriveNumericSummaryFromDataset = (def: PatientListDatasetDefinition, ids: PatientId[]): PatientListDatasetDefinition => {
            const cols = getNumericSummaryDatasetColums(def);
            const sumDef: PatientListDatasetDefinition = {
                columns: cols.map,
                displayName: def.displayName,
                id: def.id,
                multirow: false,
                responderStates: new Map(),
                shape: 0,
                totalRows: ids.length
            };

            // Short-circuit if the dataset doesn't have a date or numeric column
            if (!def.dateValueColumn || !def.numericValueColumn) { return sumDef; }

            for (let i = 0; i < ids.length; i++) {
                const p: Patient = patientMap.get(ids[i])!;
                const data = p.multirowData.get(def.id);
                const ds = new Map();

                // Make sure we have data to work with
                if (!data) { continue; }

                const vals: XY[] = data.map((d: PatientListRowDTO) => ({ x: d[def.dateValueColumn!], y: d[def.numericValueColumn!] }))
                const numVals: XY[] = vals.filter((d: XY) => +d.y).sort((a: XY, b: XY) => a.y - b.y);

                // Compute earliest and latest
                const firstDate = vals[0].x;
                const firstVal = vals[0].y;
                const lastDate = vals[vals.length - 1].x;
                const lastVal = vals[vals.length - 1].y;

                ds.set(cols.lookup.earliestDate, firstDate);
                ds.set(cols.lookup.earliest, firstVal);
                ds.set(cols.lookup.mostRecentDate, lastDate);
                ds.set(cols.lookup.mostRecent, lastVal);
                ds.set(cols.lookup.count, vals.length);

                // Compute numeric stats
                if (numVals.length) {
                    const min = numVals[0].y;
                    const max = numVals[numVals.length - 1].y;
                    const mean = +(((numVals.reduce((a: number, b: XY) => a + b.y, 0)) / numVals.length).toFixed(1));
                    const half = Math.floor(numVals.length / 2);
                    const median = numVals.length % 2
                        ? numVals[half].y
                        : (numVals[half - 1].y + numVals[half].y) / 2.0;
                    
                    ds.set(cols.lookup.min, min);
                    ds.set(cols.lookup.max, max);
                    ds.set(cols.lookup.mean, mean);
                    ds.set(cols.lookup.median, median);
                    ds.set(cols.lookup.trend, vals);
                }
                p.singletonData.set(def.id, ds);
                patientMap.set(p.compoundId, p);
                setDetailRows(p.compoundId);
            }
            return sumDef;
        };

        /*
         * Return a map and column id lookup object for
         * a given non-numeric dataset definition.
         */
        const getNonNumericSummaryDatasetColums = (def: PatientListDatasetDefinition): DerivedColumnLookup => {
            const caps = /([A-Z])/g;
            const firstToUpper = /^./;
            const camelCaseToUpperSpaced = (colName: string) => colName.replace(caps, ' $1').replace(firstToUpper, (col: string) => col.toUpperCase());
            const cols = getDerivedNonNumericColumnsTemplate();
            Array.from(Object.keys(cols)).forEach((k: string, i: number) => {
                const col = cols[k];
                col.index = i;
                col.displayName = `${def.displayName}${camelCaseToUpperSpaced(col.id)}`;
                col.id = `${def.displayName}_${col.id}`.toLowerCase().replace(' ','_');
                col.isDisplayed = col.isDisplayed || false;
                col.datasetId = def.id;
            });

            return {
                lookup: {
                    count: cols.count.id,
                    earliest: cols.earliest.id,
                    earliestDate: cols.earliestDate.id,
                    mostRecent: cols.mostRecent.id,
                    mostRecentDate: cols.mostRecentDate.id,
                },
                map: new Map([
                    [cols.count.id, cols.count],
                    [cols.mostRecent.id, cols.mostRecent],
                    [cols.mostRecentDate.id, cols.mostRecentDate],
                    [cols.earliest.id, cols.earliest],
                    [cols.earliestDate.id, cols.earliestDate]
                ])
            } as DerivedColumnLookup;
        };

        /*
         * Derive a summary non-numeric singleton dataset from 
         * a multirow numeric dataset. The new dataset definition
         * is returned to the caller, and rows are added to the cache.
         */
        const deriveNonNumericSummaryFromDataset = (def: PatientListDatasetDefinition, ids: PatientId[]): PatientListDatasetDefinition => {
            const cols = getNonNumericSummaryDatasetColums(def);
            const sumDef: PatientListDatasetDefinition = {
                columns: cols.map,
                displayName: def.displayName,
                id: def.id,
                multirow: false,
                responderStates: new Map(),
                shape: 0
            };

            // Short-circuit if the dataset doesn't have a date or numeric column
            if (!def.dateValueColumn || !def.stringValueColumn) { return sumDef; }

            for (let i = 0; i < ids.length; i++) {
                const p: Patient = patientMap.get(ids[i])!;
                const data = p.multirowData.get(def.id);
                const ds = new Map();

                // Make sure we have data to work with
                if (!data) { continue; }

                const vals: XY[] = data.map((d: PatientListRowDTO) => ({ x: d[def.dateValueColumn!], y: d[def.stringValueColumn!] }));

                // Compute earliest and latest
                const firstDate = vals[0].x;
                const firstVal = vals[0].y;
                const lastDate = vals[vals.length - 1].x;
                const lastVal = vals[vals.length - 1].y;

                ds.set(cols.lookup.earliestDate, firstDate);
                ds.set(cols.lookup.earliest, firstVal);
                ds.set(cols.lookup.mostRecentDate, lastDate);
                ds.set(cols.lookup.mostRecent, lastVal);
                ds.set(cols.lookup.count, vals.length);
                p.singletonData.set(def.id, ds);
                patientMap.set(p.compoundId, p);
                setDetailRows(p.compoundId);
            }
            return sumDef;
        };

        /*
         * Convert tuple objects to csv-friendly strings.
         */ 
        const valueToCsvString = (d: any) => {
            return (
                !d ? '' 
               : d instanceof Date ? d.toLocaleString().replace(',','') 
               : String(d)
                    .replace(/(\r\n|\n|\r|\s+|\t|&nbsp;)/gm,' ')
                    .replace(/"/g, '""')
                    .replace(/ +(?= )/g,'')
            );
        };

        /*
         * Pulls all cache data for all datasets into a
         * JSON object for export (currently only to REDCap).
         */
        const getAllData = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { config, requestId, useDisplayedColumnsOnly } = payload;
            const data: PatientListDatasetExport[] = [];
            const singletonData: PatientListDatasetExport = { columns: [], data: [], datasetId: 'demographics', isMultirow: false, maxRows: 1 };
            const colPersonId = 'personId';

            // Add the personId column
            singletonData.columns.push(singletonDatasets.get('demographics')!.columns.get(colPersonId)!);

            // Use only the columns currently displayed or retrieve all (user selects one option or the other)
            if (useDisplayedColumnsOnly) {
                singletonData.columns.concat(config!.displayColumns.filter((col: PatientListColumn) => col.type !== typeSparkline && col.id !== colPersonId));
            } else {
                singletonDatasets.forEach((def: PatientListDatasetDefinition) => {
                    def.columns.forEach((col: PatientListColumn) => {
                        if (col.type !== typeSparkline && col.id !== colPersonId) {
                            singletonData.columns.push(col);
                        }
                    });
                });
            }

            // Add singleton rows
            patientMap.forEach((p: Patient) => {
                const row: any = {};
                singletonData.columns.forEach((col: PatientListColumn) =>  {
                    const ds = p.singletonData.get(col.datasetId)!;
                    const d = ds ? ds.get(col.id) : '';
                    row[col.id] = d;
                });
                row[colPersonId] = p.compoundId;
                singletonData.data.push(row);
            });
            data.push(singletonData);

            // Add multirow rows
            multirowDatasets.forEach((mds: PatientListDatasetDefinition) => {
                const mdsName = mds.displayName.replace(' ','_').toLowerCase();
                const mdsCols: PatientListColumn[] = [ { id: colPersonId, datasetId: mdsName, index: 0, isDisplayed: true, type: typeString } ];
                mds.columns.forEach((col: PatientListColumn) => mdsCols.push(col));
                const exportData: PatientListDatasetExport = { columns: mdsCols, data: [], datasetId: mdsName, dateValueColumn: mds.dateValueColumn, isMultirow: true, maxRows: 1 };

                patientMap.forEach((p: Patient) => {
                    const ds = p.multirowData.get(mds.id)!;
                    let rowCount = 0;
                    if (ds) {
                        for (let i = 0; i < ds.length; i++) {
                            const row: any[] = [];
                            const vals: any = ds[i];
                            for (let j = 0; j < mdsCols.length; j++) {
                                const d = vals[mdsCols[j].id];
                                if (d) {
                                    row[mdsCols[j].id] = d;
                                    rowCount++;
                                }
                            }
                            row[colPersonId] = p.compoundId;
                            exportData.data.push(row);
                        }
                    }
                    exportData.maxRows = rowCount > exportData.maxRows ? rowCount : exportData.maxRows;
                });
                data.push(exportData);
            });

            return { requestId, result: data }
        };

        /*
         * Converts cache data to csv format 
         * for a given multirow dataset.
         */
        const getMultirowDataCsv = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { datasetId, requestId } = payload;
            const nl = '\r\n';
            const rows: string[] =[];
            const cols: PatientListColumn[] = [ { id: 'personId', datasetId: datasetId!, index: 0, isDisplayed: true, type: typeString } ];
            multirowDatasets.get(datasetId!)!.columns.forEach((col: PatientListColumn) => cols.push(col));

            // Add column headers
            rows.push(cols.map((col: PatientListColumn) => col.id).join(','));

            // Add rows
            patientMap.forEach((p: Patient) => {
                const ds = p.multirowData.get(datasetId!)!;
                if (ds) {
                    for (let i = 0; i < ds.length; i++) {
                        const row: any[] = [];
                        const vals: any = ds[i];
                        for (let j = 0; j < cols.length; j++) {
                            const d = vals[cols[j].id];
                            row.push(`"${valueToCsvString(d)}"`);
                        }
                        rows.push(row.join(','));
                    }
                }
            });
            return { requestId, result: rows.join(nl) };
        };

        /*
         * Converts cache data to csv format
         * representing the columnar table displayed
         * in the UI.
         */
        const getSingletonDataCsv = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { config, requestId, useDisplayedColumnsOnly } = payload;
            const nl = '\r\n';
            const rows: string[] =[];
            let cols: PatientListColumn[] = [];

            // Use only the columns currently displayed or retrieve all (user selects one option or the other)
            if (useDisplayedColumnsOnly) {
                cols = config!.displayColumns.filter((col: PatientListColumn) => col.type !== typeSparkline)
            } else {
                singletonDatasets.forEach((def: PatientListDatasetDefinition) => {
                    def.columns.forEach((col: PatientListColumn) => {
                        if (col.type !== typeSparkline) {
                            cols.push(col);
                        }
                    });
                });
            }
            
            // Add column headers
            rows.push(cols.map((col: PatientListColumn) => col.id).join(','));

            // Add rows
            patientMap.forEach((p: Patient) => {
                const row: any[] = [];
                cols.forEach((col: PatientListColumn) =>  {
                    const ds = p.singletonData.get(col.datasetId)!;
                    const d = ds ? ds.get(col.id) : undefined;
                    row.push(`"${valueToCsvString(d)}"`);
                });
                rows.push(row.join(','));
            });
            return { requestId, result: rows.join(nl) };
        };
    }
}

