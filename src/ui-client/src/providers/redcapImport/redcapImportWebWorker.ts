/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { REDCapImportConfiguration, REDCapUrn, REDCapConcept } from '../../models/redcapApi/ImportConfiguration';
import { ImportRecord } from '../../models/dataImport/ImportRecord';
import { REDCapFieldMetadata } from '../../models/redcapApi/Metadata';
import { workerContext } from './redcapImportWebWorkerContext';
import { REDCapEavRecord } from '../../models/redcapApi/Record';

const LOAD_IMPORT_CONFIGURATION = 'LOAD_IMPORT_CONFIGURATION';
const CALCULATE_PATIENT_COUNT = 'CALCULATE_PATIENT_COUNT';
const GET_RECORDS = 'GET_RECORDS';
const CLEAR_RECORDS = 'CLEAR_RECORDS';

export interface OutboundMessageResultCount {
    value: number
}

interface REDCapImportFieldMetadata {
    event?: string;
    form: string;
    id: string;
    name: string;
    isString: boolean;
    isDate: boolean;
    isNumber: boolean;
    options: REDCapImportFieldMetadataOption[];
    source: REDCapFieldMetadata;
    urn: REDCapUrn;
}

interface REDCapImportFieldMetadataOption {
    text: string;
    value: number;
}

interface InboundMessagePartialPayload {
    concept?: REDCapConcept;
    config?: REDCapImportConfiguration;
    id?: string;
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
            ${this.addMessageTypesToContext([ LOAD_IMPORT_CONFIGURATION, CALCULATE_PATIENT_COUNT, GET_RECORDS, CLEAR_RECORDS ])}
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

    public loadConfig = (config: REDCapImportConfiguration) => {
        return this.postMessage({ message: LOAD_IMPORT_CONFIGURATION, config });
    }

    public calculatePatientCount = (concept: REDCapConcept) => {
        return this.postMessage({ message: CALCULATE_PATIENT_COUNT, concept });
    }

    public getRecords = (id: string) => {
        return this.postMessage({ message: GET_RECORDS, id });
    }

    public clearRecords = () => {
        return this.postMessage({ message: CLEAR_RECORDS });
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
                case GET_RECORDS:
                    return getRecords(payload);
                case CLEAR_RECORDS:
                    return clearRecords(payload);
                default:
                    return null;
            }
        };

        let metadata: Map<string,REDCapImportFieldMetadata> = new Map();
        let records: ImportRecord[] = [];

        /*
         * Clear all current records.
         */
        const clearRecords = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId } = payload;
            metadata = new Map();
            records = [];
            return { requestId };
        };

        /*
         * Return all current records.
         */
        const getRecords = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId } = payload;
            return { requestId, result: records };
        };

        /*
         * Load the raw REDCap project data from the API.
         */
        const loadConfig = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId, config } = payload;
            
            deriveImportMetadata(config!);
            deriveImportRecords(config!);
            const concepts = deriveConceptTree(config!);

            return { requestId, result: concepts };
        };

        /*
         * Calculate counts for a given REDCap variable
         * (to be transformed into a Leaf Concept).
         */
        const calculatePatientCount = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId, concept } = payload;
            const urn = Object.assign({}, concept!.urn, { value: undefined, instance: undefined });
            const universalId = urnToString(urn);

            const query = concept!.urn.value 
                ? (r: ImportRecord) => r.id.startsWith(universalId) && r.valueNumber === concept!.urn.value
                : (r: ImportRecord) => r.id.startsWith(universalId);

            const pats = records.filter(query).map(p => p.sourcePersonId);
            const count: OutboundMessageResultCount = { value: new Set(pats).size };

            return { requestId, result: count };
        };

        /*
         * Derive useful Leaf-centric metadata for REDCap fields.
         * These are used only as an intermediate object on intial load.
         */
        const deriveImportMetadata = (config: REDCapImportConfiguration): void => {
            const DESCRIPTIVE = 'descriptive';
            const NUMBER = 'number';
            const INTEGER = 'integer';
            const CALC = 'calc';
            const DATE = 'date';
            const exclude = new Set([ DESCRIPTIVE ]);

            for (let i = 0; i < config.metadata.length; i++) {
                const field = config.metadata[i];
                const validation = field.text_validation_type_or_show_slider_number;
                let event;

                /*
                 * Skip if not an included field type.
                 */
                if (exclude.has(field.field_type)) { continue; }

                /*
                 * Try to match to an event, if applicable.
                 */
                if (config.eventMappings) {
                    const eventMap = config.eventMappings.find(em => em.form === field.form_name);
                    if (eventMap) {
                        event = eventMap.unique_event_name;
                    }
                }

                const m: REDCapImportFieldMetadata = {
                    form: field.form_name,
                    id: field.field_name,
                    name: field.field_label,
                    source: field,
                    urn: { 
                        project: config.projectInfo.project_id,
                        form: field.form_name,
                        field: field.field_name,
                        event
                    },
                    options: [],
                    isString: false,
                    isDate: false,
                    isNumber: false
                };
                m.options = deriveFieldOptions(m);

                /*
                 * Determine validation type, if any.
                 */
                if (validation === NUMBER || validation === INTEGER || validation === CALC || m.options.length) {
                    m.isNumber = true;
                } else if (validation.indexOf(DATE) > -1) {
                    m.isDate = true;
                } else {
                    m.isString = true;
                }
                metadata.set(m.name, m);
            }
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

            if (type === YESNO) {
                return [{ text: YES, value: 1 }, { text: NO, value: 0 }];
            }
            if (type === TRUEFALSE) {
                return [{ text: TRUE, value: 1 }, { text: FALSE, value: 0 }];
            }
            if (type === DROPDOWN || type === RADIO || type === CHECKBOX) {
                return choices.split(OPTION_DELIMETER).map(opt => {
                    const x = opt.split(TEXT_VALUE_DELIMITER);
                    return { text: x[1].trim(), value: +x[0] }
                });
            }
            return [];
        };

        /*
         * Converts a REDCapUrn to a string, for the universalId.
         * Example: urn:leaf:concept:import:redcap:<project_id>:<form_name>:<field_name>:val=<value>&inst=<instance>
         */
        const urnToString = (urn: REDCapUrn): string => {
            const parts = [ 'urn', 'leaf', 'import', 'redcap', urn.project ];
            const params = [];

            if (urn.form) {
                parts.push(urn.form);
            }
            if (urn.field) {
                parts.push(urn.field);
            }
            if (urn.value !== undefined) {
                params.push(`val=${urn.value}`)
            }
            if (urn.instance !== undefined) {
                params.push(`inst=${urn.instance}`)
            }
            if (params.length > 0) {
                parts.push(params.join('&'));
            }

            return parts.join(':');
        };

        const deriveImportRecords = (config: REDCapImportConfiguration) => {
            const seen: Map<string, number> = new Map();
            const mrnMap: Map<string, string> = new Map(config.mrns.map(m => [ m[config.recordField], m[config.mrnField] ]));

            for (let i = 0; i < config!.records.length; i++) {
                const raw = config!.records[i] as REDCapEavRecord;
                const field = metadata.get(raw.field_name);
                const sourcePersonId = mrnMap.get(raw.record);

                if (!field || !sourcePersonId || raw.value === '') { continue; }

                const uniqueId = `${urnToString({ ...field.urn })}_${raw.record}`;
                const prevInstance = seen.get(uniqueId);
                const instance = prevInstance ? (prevInstance + 1) : 1;
                
                const rec: ImportRecord = {
                    id: urnToString({ ...field.urn, instance }),
                    sourcePersonId,
                    sourceValue: raw.value.toString(),
                    sourceModifier: raw.redcap_event_name
                };

                /*
                 * If a string.
                 */
                if (field.isString) {
                    rec.valueString = rec.sourceValue;
                }
                /*
                 * Else if a date.
                 */
                else if (field.isDate) {
                    const d = new Date(rec.sourceValue);
                    const y = d.getFullYear();

                    if (d instanceof Date && !isNaN(y) && y > 1900 && y < 2100) {
                        rec.valueDate = d;
                    } else { 
                        continue; 
                    }
                }
                /*
                 * Else if a number.
                 */
                else if (field.isNumber) {
                    const v = parseFloat(rec.sourceValue);

                    if (v > 99999999 || v < -99999999) {
                        continue;
                    }
                    rec.valueNumber = v;
                }
                seen.set(uniqueId, instance);
                records.push(rec);
            }
        };

        /*
         * Derive Leaf concepts based on REDCap project structure.
         */
        const deriveConceptTree = (config: REDCapImportConfiguration): REDCapConcept[] => {
            const urn: REDCapUrn = { project: config.projectInfo.project_id };
            const id = urnToString(urn);
            const text = `Had data in REDCap Project "${config.projectInfo.project_title}"`;
            let concepts: REDCapConcept[] = [];

            const root: REDCapConcept = {
                rootId: id,
                id: id,
                universalId: id,
                urn,
                isEncounterBased: false,
                isParent: true,
                isNumeric: false,
                isEventBased: false,
                isPatientCountAutoCalculated: false,
                isSpecializable: false,
                isExtension: true,
                isFetching: false,
                isOpen: false,
                childrenLoaded: true,
                childrenIds: new Set(),
                uiDisplayName: config.projectInfo.project_title,
                uiDisplayText: text
            };
            const byForm = deriveByFormConcept(root, config);
            concepts = byForm.concat([ root ]);

            if (config.projectInfo.is_longitudinal) {
                const byEvent = deriveByEventConcept(root, config);
                concepts = concepts.concat(byEvent);
            }

            /* 
             * Load childrenIds for each parent.
             */
            const mapped: [string, REDCapConcept][] = concepts.map(c => [c.id, c]);
            const conceptMap = new Map(mapped);

            conceptMap.forEach(c => {
                if (c.parentId) {
                    const p = conceptMap.get(c.parentId);
                    if (p) {
                        p.childrenIds!.add(c.id);
                    }
                }
            });

            return [ ...conceptMap.values() ];
        };

        /*
         * Derive a REDCap Concept structure based on:
         * By Event => Event1, Event2 ...
         */
        const deriveByEventConcept = (root: REDCapConcept, config: REDCapImportConfiguration): REDCapConcept[] => {
            const idMod = 'event'
            const concept: REDCapConcept = {
                ...root,
                id: `${root.universalId}:${idMod}`,
                parentId: root.id,
                childrenIds: new Set(),
                uiDisplayName: 'By Event'
            };

            return config.events!
                .map(e => deriveEventConcept(concept, e.event_name, idMod, config))
                .reduce((a, b) => a.concat(b),[])
                .concat([ concept ]);
        };

        /*
         * Derive a REDCap Concept structure based on:
         * By Form => Form1, Form2 ...
         */
        const deriveByFormConcept = (root: REDCapConcept, config: REDCapImportConfiguration): REDCapConcept[] => {
            const idMod = 'form'
            const concept: REDCapConcept = {
                ...root,
                id: `${root.universalId}:${idMod}`,
                parentId: root.id,
                childrenIds: new Set(),
                uiDisplayName: 'By Form'
            };
            
            return config.forms!
                .map(f => deriveFormConcept(concept, f.instrument_name, idMod))
                .reduce((a, b) => a.concat(b),[])
                .concat([ concept ]);
        };

        /*
         * Derive a REDCap Concept structure based on:
         * Event => Form1, Form2 ...
         */
        const deriveEventConcept = (parent: REDCapConcept, event: string, idMod: string, config: REDCapImportConfiguration): REDCapConcept[] => {
            const urn: REDCapUrn = Object.assign({}, parent.urn, { event });
            const universalId = urnToString(urn);
            const concept: REDCapConcept = {
                ...parent,
                id: `${universalId}:${idMod}`,
                universalId,
                urn,
                parentId: parent.id,
                childrenIds: new Set(),
                uiDisplayName: event,
                uiDisplayText: `${parent.uiDisplayText} event "${event}"`
            };

            return config.eventMappings!
                .filter(em => em.unique_event_name === event)
                .map(f => deriveFormConcept(concept, f.form, idMod))
                .reduce((a, b) => a.concat(b),[])
                .concat([ concept ]);
        }; 

        /*
         * Derive a REDCap Concept structure based on:
         * Form => Field1, Field2 ...
         */
        const deriveFormConcept = (parent: REDCapConcept, form: string, idMod: string): REDCapConcept[] => {
            const urn: REDCapUrn = Object.assign({}, parent.urn, { form });
            const universalId = urnToString(urn);
            const concept: REDCapConcept = {
                ...parent,
                id: `${universalId}:${idMod}`,
                universalId,
                urn,
                parentId: parent.id,
                childrenIds: new Set(),
                uiDisplayName: form,
                uiDisplayText: `${parent.uiDisplayText} form "${form}"`
            };
            
            return [ ...metadata.values() ]
                .filter(f => f.form === form)
                .map(f => deriveFieldConcept(concept, f, idMod))
                .reduce((a, b) => a.concat(b),[])
                .concat([ concept ]);
        };

        /*
         * Derive a REDCap Concept structure based on:
         * Field => Option1?, Option2? ...
         */
        const deriveFieldConcept = (parent: REDCapConcept, field: REDCapImportFieldMetadata, idMod: string): REDCapConcept[] => {
            const urn: REDCapUrn = Object.assign({}, parent.urn, { field: field.id });
            const universalId = urnToString(urn);
            const concept: REDCapConcept = {
                ...parent,
                id: `${universalId}:${idMod}`,
                universalId,
                urn,
                parentId: parent.id,
                isParent: field.options.length > 0,
                isEncounterBased: field.isDate,
                childrenIds: new Set(),
                uiDisplayName: field.name,
                uiDisplayText: `${parent.uiDisplayText} field "${field.name}"`
            };
            
            return field.options
                .map(op => deriveFieldOptionConcept(concept, op, idMod))
                .concat([ concept ]);
        };

        /*
         * Derive a REDCapConcept for an option within a field.
         */
        const deriveFieldOptionConcept = (parent: REDCapConcept, option: REDCapImportFieldMetadataOption, idMod: string): REDCapConcept => {
            const urn: REDCapUrn = Object.assign({}, parent.urn, { value: option.value });
            const universalId = urnToString(urn);

            return {
                ...parent,
                id: `${universalId}:${idMod}`,
                universalId,
                urn,
                parentId: parent.id,
                isParent: false,
                isEncounterBased: false,
                childrenIds: new Set(),
                uiDisplayName: option.text,
                uiDisplayText: `${parent.uiDisplayText} of "${option.text}"`
            };
        };
    }
}