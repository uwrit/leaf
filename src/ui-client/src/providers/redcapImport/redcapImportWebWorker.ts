/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { REDCapImportConfiguration, REDCapUrn } from '../../models/redcapApi/ImportConfiguration';
import { REDCapEavRecord } from '../../models/redcapApi/Record';
import { ImportRecord } from '../../models/dataImport/ImportRecord';
import { REDCapFieldMetadata } from '../../models/redcapApi/Metadata';
import { Concept } from '../../models/concept/Concept';

const LOAD_IMPORT_CONFIGURATION = 'LOAD_IMPORT_CONFIGURATION';
const CALCULATE_PATIENT_COUNT = 'CALCULATE_PATIENT_COUNT';

export interface OutboundMessageResultCount {
    value: number
}

interface REDCapImportFieldMetadata {
    event?: string;
    form: string;
    include: boolean;
    name: string;
    isString: boolean;
    isDate: boolean;
    isNumber: boolean;
    options: REDCapImportFieldMetadataOption[];
    source: REDCapFieldMetadata;
}

interface REDCapImportFieldMetadataOption {
    parent: REDCapImportFieldMetadata;
    text: string;
    value: number;
}

interface InboundMessagePartialPayload {
    config?: REDCapImportConfiguration;
    message: string;
    field_name?: string;
    search_value?: any;
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

export default class REDCapImportWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([ LOAD_IMPORT_CONFIGURATION, CALCULATE_PATIENT_COUNT ])}
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

    public loadConfig = (config: REDCapImportConfiguration) => {
        return this.postMessage({ message: LOAD_IMPORT_CONFIGURATION, config });
    }

    public calculatePatientCount = (field_name: string, search_value?: any) => {
        return this.postMessage({ message: CALCULATE_PATIENT_COUNT, field_name, search_value });
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
                case LOAD_IMPORT_CONFIGURATION:
                    return loadConfig(payload);
                case CALCULATE_PATIENT_COUNT:
                    return calculatePatientCount(payload);
                default:
                    return null;
            }
        };

        let config: any;
        let metadata: Map<string,REDCapImportFieldMetadata>;
        let records: ImportRecord[] = [];

        /*
         * Load the raw REDCap project data from the API.
         */
        const loadConfig = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId } = payload;
            config = payload.config!;
            deriveImportRecords(config);
            return { requestId };
        };

        /*
         * Calculate counts for a given REDCap variable
         * (to be transformed into a Leaf Concept).
         */
        const calculatePatientCount = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId, field_name, search_value } = payload;
            const data = config as REDCapImportConfiguration;
            const field = metadata.get(field_name!);

            if (!field) { return { requestId, result: { value: 0 } }; }

            const query = search_value 
                ? (r: REDCapEavRecord) => r.field_name === field_name && r.value === search_value.toString()
                : (r: REDCapEavRecord) => r.field_name === field_name;

            const pats = data.records.filter(query).map(p => p.record);
            const count: OutboundMessageResultCount = { value: new Set(pats).size };

            return { requestId, result: count };
        };

        /*
         * Derive useful Leaf-centric metadata for REDCap fields.
         * These are used only as an intermediate object on intial load.
         */
        const deriveImportMetadata = (raw: REDCapFieldMetadata[]): Map<string,REDCapImportFieldMetadata> => {
            const meta: Map<string,REDCapImportFieldMetadata> = new Map();
            const DESCRIPTIVE = 'descriptive';
            const NUMBER = 'number';
            const INTEGER = 'integer';
            const CALC = 'calc';
            const DATE = 'date';

            for (let i = 0; i < raw.length; i++) {
                const field = raw[i];
                const validation = field.text_validation_type_or_show_slider_number;

                const m: REDCapImportFieldMetadata = {
                    form: field.form_name,
                    include: field.field_type !== DESCRIPTIVE,
                    name: field.field_name,
                    source: field,
                    options: [],
                    isString: false,
                    isDate: false,
                    isNumber: false
                };
                m.options = deriveFieldOptions(m);

                if (validation === NUMBER || validation === INTEGER || validation === CALC) {
                    m.isNumber = true;
                } else if (validation.indexOf(DATE) > -1) {
                    m.isDate = true;
                } else {
                    m.isString = true;
                }
                meta.set(m.name, m);
            }
            metadata = meta;
            return meta;
        };

        /*
         * Derive options within a REDCap field. In REDCap these are '|' and ',' delimited.
         */
        const YESNO = 'yesno';
        const TRUEFALSE = 'truefalse';
        const DROPDOWN = 'dropdown';
        const RADIO = 'radio';
        const CHECKBOX = 'checkbox';
        const TRUE = 'True';
        const FALSE = 'False';
        const YES = 'Yes';
        const NO = 'No';
        const OPTION_DELIMETER = '|';
        const TEXT_VALUE_DELIMITER = ',';

        const deriveFieldOptions = (field: REDCapImportFieldMetadata): REDCapImportFieldMetadataOption[] => {
            const type = field.source.field_type;
            const choices = field.source.select_choices_or_calculations;
            const parent = field;

            if (type === YESNO) {
                return [{ text: YES, value: 1, parent }, { text: NO, value: 0, parent }];
            }
            if (type === TRUEFALSE) {
                return [{ text: TRUE, value: 1, parent }, { text: FALSE, value: 0, parent }];
            }
            if (type === DROPDOWN || type === RADIO || type === CHECKBOX) {
                return choices.split(OPTION_DELIMETER).map(opt => {
                    const x = opt.split(TEXT_VALUE_DELIMITER);
                    return { text: x[1], value: +x[0], parent }
                });
            }
            return [];
        };

        const urnToString = (urn: REDCapUrn): string => {
            // urn:leaf:concept:import:type=redcap&proj=100&form=demographics&field=name&event=event1
            // urn:leaf:concept:import:type=redcap&proj=100&form=demographics&field=name&value=1&event=event1

            const base = [ 'urn', 'leaf', 'concept' ];
            const parts = [ `type=redcap`, `proj=${urn.project}` ];

            if (urn.form) {
                parts.push(`form=${urn.form}`);
            }
            if (urn.field) {
                parts.push(`field=${urn.field}`);
            }
            if (urn.numValue) {
                parts.push(`numval=${urn.numValue}`)
            }
            if (urn.event) {
                parts.push(`event=${urn.event}`)
            }

            base.push(parts.join('&'));
            return base.join(':');
        };

        const deriveImportRecords = (payload: InboundMessagePayload) => {
            const { config } = payload;
            const meta = deriveImportMetadata(config!.metadata);
            const recs: ImportRecord[] = [];

            for (let i = 0; i < config!.records.length; i++) {
                const raw = config!.records[i];
                const field = meta.get(raw.field_name);

                if (!field || raw.value === '') { continue; }

                const rec: ImportRecord = {
                    id: '',
                    sourcePersonId: raw.record,
                    sourceValue: raw.value.toString()
                };
                
                /*
                 * If a string.
                 */
                if (field.isString) {
                    rec.valueString = rec.sourceValue;

                /*
                 * Else if a date.
                 */
                } else if (field.isDate) {
                    const d = new Date(rec.sourceValue);
                    const y = d.getFullYear();

                    /* 
                     * If valid.
                     */
                    if (d instanceof Date && !isNaN(d.getTime()) && y > 1900 && y < 2100) {
                        rec.valueDate = d;
                    } else { 
                        continue; 
                    }

                /*
                 * Else if a number.
                 */
                } else if (field.isNumber) {
                    const v = parseFloat(rec.sourceValue);

                    if (v > 99999999 || v < -99999999) {
                        continue;
                    }
                    rec.valueNumber = v;
                }
                recs.push(rec);
            }
            records = recs;
        };

        /*
         * Derive Leaf concepts based on REDCap project structure.
         */
        const deriveLeafConcepts = (config: REDCapImportConfiguration): Concept[] => {
            const concepts: Concept[] = [];
            const baseUrn: REDCapUrn = { project: config.projectInfo.project_id };
            const baseText = `Had data in REDCap Project "${config.projectInfo.project_title}"`;

            /* 
             * Root.
             */
            const rootCpt: Concept = {
                rootId: '',
                id: urnToString(baseUrn),
                isEncounterBased: true,
                isParent: true,
                isNumeric: false,
                isEventBased: false,
                isPatientCountAutoCalculated: false,
                isSpecializable: false,
                isExtension: true,
                isFetching: false,
                isOpen: false,
                childrenLoaded: true,
                uiDisplayName: config.projectInfo.project_title,
                uiDisplayText: baseText
            };
            rootCpt.rootId = rootCpt.id;
            rootCpt.universalId = rootCpt.id;
            concepts.push(rootCpt);

            /*
             * If longitudinal, add branches by event.
             */
            if (config.projectInfo.is_longitudinal && config.events) {

                /* 
                 * By Event.
                 */
                const byEvent: Concept = {
                    ...rootCpt,
                    id: `${rootCpt}&byevent`,
                    universalId: rootCpt.universalId,
                    uiDisplayName: 'By Event'
                };
                concepts.push(byEvent);

                /*
                 * For each Event.
                 */
                config.events.forEach(e => {
                    const evUrn: REDCapUrn = { ...baseUrn, event: e.event_name };
                    const evStrUrn = urnToString(evUrn);
                    const eventCpt: Concept = {
                        ...rootCpt,
                        id: evStrUrn,
                        universalId: evStrUrn,
                        uiDisplayName: e.event_name,
                        uiDisplayText: `${baseText} event "${e.event_name}"`
                    };
                    concepts.push(eventCpt);
                });
            }

            metadata.forEach(f => {
                const text = `Had data in REDCap Project "${config.projectInfo.project_title}" field "${f.name}"`;
                const urn: REDCapUrn = { project: config.projectInfo.project_id, event: f.event, form: f.form, field: f.name };
                const strUrn = urnToString(urn);
                
                const cpt: Concept = {
                    rootId: '',
                    id: strUrn,
                    universalId: strUrn,
                    isEncounterBased: true,
                    isParent: f.options.length > 0,
                    isNumeric: f.isNumber,
                    isEventBased: false,
                    isPatientCountAutoCalculated: false,
                    isSpecializable: false,
                    isExtension: true,
                    isFetching: false,
                    isOpen: false,
                    childrenLoaded: true,
                    uiDisplayName: f.name,
                    uiDisplayText: text
                };
                concepts.push(cpt);

                for (let i = 0; i < f.options.length; i++) {
                    const opt = f.options[i];
                    const optUrn: REDCapUrn = { ...urn, numValue: opt.value };
                    const optStrUrn = urnToString(optUrn);
                    const optCpt: Concept = {
                        ...cpt,
                        id: optStrUrn,
                        universalId: optStrUrn,
                        parentId: strUrn,
                        isParent: false,
                        uiDisplayName: opt.text,
                        uiDisplayText: `${text} of "${opt.text}"`
                    }
                    concepts.push(optCpt);
                }
            })

            return concepts;
        };
    }
}