/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { REDCapExportOptions } from '../../models/state/Export';
import REDCapEvent from '../../models/redcapExport/Event';
import REDCapEventMapping from '../../models/redcapExport/EventMapping';
import REDCapExportConfiguration from '../../models/redcapExport/ExportConfiguration';
import REDCapFieldMetadata from '../../models/redcapExport/Metadata';
import REDCapRepeatingFormEvent from '../../models/redcapExport/RepeatingFormEvent';
import REDCapUser from '../../models/redcapExport/User';
import { PatientListColumnType, PatientListColumn } from '../../models/patientList/Column';
import { PatientListDatasetExport } from '../../models/patientList/Dataset';
import { workerContext } from './redcapExportWebWorkerContext';

const CREATE_EXPORT_CONFIGURATION = 'CREATE_EXPORT_CONFIGURATION';

const typeString = PatientListColumnType.string;
const typeNum = PatientListColumnType.number;
const typeDate = PatientListColumnType.date;
const typeSparkline = PatientListColumnType.sparkline;

interface REDCapExportEventsAndMappings {
    events: REDCapEvent[];
    eventMappings: REDCapEventMapping[];
}

interface REDCapExportDerivedPatientListData {
    datasets: PatientListDatasetExport[];
    records: object[];
}

interface REDCapExportDerivedPatientListColumn extends PatientListColumn {
    redcapFieldName: string;
}

interface InboundMessagePartialPayload {
    message: string;
    patientList?: PatientListDatasetExport[];
    projectTitle?: string;
    options?: REDCapExportOptions;
    useRepeatingForms?: boolean;
    username?: string;
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

export default class REDCapExportWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([ CREATE_EXPORT_CONFIGURATION ])}
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
        this.worker.onerror = error => { console.log(error); this.reject(error) };
    }

    public createProjectConfiguration = (options: REDCapExportOptions, patientList: any, projectTitle: string, username: string, useRepeatingForms: boolean) => {
        return this.postMessage({ message: CREATE_EXPORT_CONFIGURATION, options, patientList, projectTitle, username, useRepeatingForms });
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
                case CREATE_EXPORT_CONFIGURATION:
                    return createExportConfiguration(payload);
                default:
                    return null;
            }
        };

        /*
         * Prepare a dataset or field name to be used in REDCap.
         */
        const invalid = new Map([ [' ', '_'], ['-',''], ['.',''], [';',''], ['!',''], [':',''] ]);
        const cleanName = (pre: string, charLimit: number): string => {
            const arr: string[] = [];

            for (let i = 0; i < pre.length; i++) {
                const t = pre[i];
                const replacement = invalid.get(t);
                if (replacement) {
                    arr.push(replacement);
                } else if (t && replacement !== "") {
                    arr.push(t);
                }
            }
            const name = arr.join('').toLowerCase();

            /* 
             * If the name is too long, generate a random integer,
             * shorten the name, and append the integer to keep the name unique.
             */ 
            if (name.length > charLimit) {
                const rand = `${Math.round(Math.random() * 1000000)}`;
                return `${name.substring(0, charLimit - rand.length - 1)}_${rand}`;
            }
            return name;
        };

        /*
         * Create a unique REDCap project export configuration
         * based on data from the patient list.
         */
        const createExportConfiguration = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId, options, patientList, projectTitle, username, useRepeatingForms } = payload;
            const dsNameLenLimit = 64;

            /*
             * Ensure the id generate for each dataset in REDCap has
             * only valid characters and is wiithin the length limit.
             */
            patientList!.forEach((d) => d.datasetId = cleanName(d.datasetId, dsNameLenLimit));

            /*
             * Marshall the data to configure and populate the project.
             */
            const derived: REDCapExportDerivedPatientListData = deriveRecords(patientList!, useRepeatingForms!, options!.rowLimit!);
            const config: REDCapExportConfiguration = {
                data: derived.records,
                metadata: deriveFieldMetadata(derived),
                project: {
                    is_longitudinal: `'${useRepeatingForms ? 0 : 1}'`,
                    project_title: projectTitle!,
                    record_autonumbering_enabled: '0',
                },
                users: [ deriveUser(options!, patientList!, username!) ]
            };

            /*
             * Only use repeating forms if the target version of REDCap supports them.
             */
            if (useRepeatingForms) {
                config.repeatingFormEvents = deriveRepeatingFormsEvents(derived);
            }
            else {
                const ev = deriveEvents(derived);    
                config.eventMappings = ev.eventMappings;
                config.events = ev.events;
            }
            return { requestId, result: config }
        };

        /*
         * Create a superset object of PatientListDatasetExport[]
         * which includes a derived field_name for REDCap
         * and and a single array of records derived from
         * all patient list datasets.
         */
        const deriveRecords = (pl: PatientListDatasetExport[], useRepeatingForms: boolean, rowLimit: number): REDCapExportDerivedPatientListData => {
            const colPersonId = 'personId';
            const colRcPersonId = colPersonId.toLowerCase();
            const colRcEventName = 'redcap_event_name';
            const colRcRepeatInstrument = 'redcap_repeat_instrument';
            const colRcRepeatInstance = 'redcap_repeat_instance';
            const derived: REDCapExportDerivedPatientListData = { datasets: pl, records: [] };
            const recordCompleteStateCode = 2;
            const fieldNameLenLimit = 100;
            let totalRowCount = 0;
            let totalRowLimitReached = false;
            let personIdAdded = false;

            /*
             * For each dataset.
             */
            for (let i = 0; i < derived.datasets.length; i++) {
                const ds = derived.datasets[i];
                const colRcCompleted = `${ds.datasetId}_complete`;
                const recordCount = new Map();
                const cols: REDCapExportDerivedPatientListColumn[] = [];

                /*
                 * Update column names by appending datasetId to avoid collisions in REDCap.
                 */
                for (let j = 0; j < ds.columns.length; j++) {
                    const col = ds.columns[j] as REDCapExportDerivedPatientListColumn;
                    col.redcapFieldName = cleanName(`${ds.datasetId}_${col.id}`, fieldNameLenLimit);
                    if (col.id !== colPersonId || (col.id === colPersonId && !personIdAdded)) {
                        if (col.id === colPersonId) {
                            personIdAdded = true;
                            col.redcapFieldName = colRcPersonId;
                        }
                        cols.push(col);
                    }
                }
                ds.columns = cols;

                /*
                 * Derive REDCap records from data.
                 */
                for (let k = 0; k < ds.data.length; k++) {
                    const r: any = ds.data[k];
                    const patientId = r[colPersonId];

                    if (patientId) {
                        let count = recordCount.get(patientId) || 0;
                        count++;
                        recordCount.set(patientId, count);

                        /*
                         * Create a unique record for REDCap, starting with
                         * the personId and 'complete' fields. Other properties
                         * are added in dynamically from the source row with
                         * the derived REDCap field_name. Event names and repeating
                         * instrument fields are added depending on the configuration
                         * of the REDCap and Leaf instances.
                         */
                        const record: any = { [colRcPersonId]: r[colPersonId], [colRcCompleted]: recordCompleteStateCode };
                        if (useRepeatingForms && ds.isMultirow) {
                            record[colRcRepeatInstrument] = ds.datasetId;
                            record[colRcRepeatInstance] = count;
                        } 
                        else if (!useRepeatingForms) {
                            record[colRcEventName] = `${ds.datasetId}${count}_arm_1`;
                        }

                        for (let l = 0; l < ds.columns.length; l++) {
                            const rcCol = ds.columns[l] as REDCapExportDerivedPatientListColumn;
                            const val = r[rcCol.id];
                            if (val) {
                                record[rcCol.redcapFieldName] = (rcCol.type === typeDate ? toREDCapDate(val) : val);
                            }
                        }
                        derived.records.push(record);
                    }
                    totalRowCount++;
                    totalRowLimitReached = rowLimit > 0 && totalRowCount >= rowLimit;
                    if (totalRowLimitReached) break;
                }
                if (totalRowLimitReached) break;
            }
            return derived;
        }

        /*
         * Derive unique events (e.g., diagnosis1, diagnosis2) and
         * the REDCap event mappings to point them to specific forms.
         * (1 Patient List Dataset => 1 REDCap Form)
         */
        const deriveEvents = (pl: REDCapExportDerivedPatientListData): REDCapExportEventsAndMappings => {
            const events: REDCapEvent[] = [];
            const eventMappings: REDCapEventMapping[] = [];

            for (let i = 0; i < pl.datasets.length; i++) {
                const ds = pl.datasets[i];
                for (let j = 1; j <= ds.maxRows; j++) {
                    const eventName = `${ds.datasetId}${j}`.toLowerCase();
                    const uniqueEventNameArm = `${eventName}_arm_1`
                    events.push({
                        event_name: eventName,
                        arm_num: '1',
                        day_offset: '1',
                        offset_min: '0',
                        offset_max: '0',
                        unique_event_name: uniqueEventNameArm
                    });
                    eventMappings.push({
                        arm_num: '1',
                        unique_event_name: uniqueEventNameArm,
                        form: ds.datasetId
                    });
                }
            }
            return { events, eventMappings };
        }

        /*
         * Derive metadata from Patient List Dataset fields
         * from REDCap. Each column in each dataset becomes
         * a field.
         */
        const deriveFieldMetadata = (pl: REDCapExportDerivedPatientListData): REDCapFieldMetadata[] => {
            const meta: REDCapFieldMetadata[] = [];

            /*
             * Of note, REDCap expects the properties to be 
             * in exactly the below order (and throws if not).
             */
            for (let i = 0; i < pl.datasets.length; i++) {
                const ds = pl.datasets[i];
                for (let j = 0; j < ds.columns.length; j++) {
                    const col = ds.columns[j] as REDCapExportDerivedPatientListColumn;
                    const field: REDCapFieldMetadata = {
                        field_name: col.redcapFieldName,
                        form_name: ds.datasetId,
                        section_header: '',
                        field_type: 'text',
                        field_label: capitalize(col.id),
                        select_choices_or_calculations: '',
                        field_note: '',
                        text_validation_type_or_show_slider_number: 
                            col.type === typeNum ? 'number' : 
                            col.type === typeDate ? 'datetime_seconds_ymd' : '',
                        text_validation_max: '',
                        text_validation_min: '',
                        identifier: '',
                        branching_logic: '',
                        required_field: '',
                        custom_alignment: '',
                        question_number: '',
                        matrix_group_name: '',
                        matrix_ranking: '',
                        field_annotation: ''
                    };
                    meta.push(field);
                }
            }
            return meta;
        }

        /*
         * Derive repeating forms events.
         */
        const deriveRepeatingFormsEvents = (pl: REDCapExportDerivedPatientListData): REDCapRepeatingFormEvent[] => {
            const repeatingForms: REDCapRepeatingFormEvent[] = [];

            for (let i = 0; i < pl.datasets.length; i++) {
                const ds = pl.datasets[i];
                if (ds.isMultirow) {
                    const form: REDCapRepeatingFormEvent = { form_name: ds.datasetId };
                    if (ds.dateValueColumn) {
                        form.custom_form_label = `[${ds.datasetId}_${ds.dateValueColumn}]`.toLowerCase();
                    }
                    repeatingForms.push(form);
                }
            }
            return repeatingForms;
        }

        /*
         * Derive a user JSON object. The Leaf user
         * is designated as the owner of the new REDCap project.
         */
        const deriveUser = (options: REDCapExportOptions, patientList: PatientListDatasetExport[], username: string): REDCapUser => {
            const forms: any = {};
            patientList.forEach((d: PatientListDatasetExport) => forms[d.datasetId] = 1);

            const user: REDCapUser = {
                username: `${username}@${options.scope}`,
                email: ``,
                firstname: 'Project',
                lastname: 'Owner',
                expiration: '',
                data_access_group: '',
                data_access_group_id: '',
                design: 0,
                user_rights: 0,
                data_access_groups: 0,
                data_export: 1,
                reports: 1,
                stats_and_charts: 1,
                manage_survey_participants: 1,
                calendar: 1,
                data_import_tool: 0,
                data_comparison_tool: 0,
                logging: 1,
                file_repository: 1,
                data_quality_create: 0,
                data_quality_execute: 0,
                api_export: 0,
                api_import: 0,
                mobile_app: 0,
                mobile_app_download_data: 0,
                record_create: 1,
                record_rename: 0,
                record_delete: 0,
                lock_records_all_forms: 0,
                lock_records: 0,
                lock_records_customization: 0,
                forms
            };
            return user;
        }

        const capitalize = (colName: string): string => {
            return colName.charAt(0).toUpperCase() + colName.slice(1).trim();
        };

        const toREDCapDate = (date: Date): string => {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const strMinutes = minutes < 10 ? '0'+minutes : minutes;
            const strHours = hours < 10 ? '0'+hours : hours;
            const strTime = `${strHours}:${strMinutes}:00`;
            return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${strTime}`;
        }
    }
}