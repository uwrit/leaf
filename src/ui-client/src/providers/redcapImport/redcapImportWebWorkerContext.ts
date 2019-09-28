/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var handleWorkMessage = function (payload) {
    switch (payload.message) {
        case LOAD_IMPORT_CONFIGURATION:
            return loadConfig(payload);
        case CALCULATE_PATIENT_COUNT:
            return calculatePatientCount(payload);
        default:
            return null;
    }
};
var metadata = new Map();
var records = [];
/*
 * Load the raw REDCap project data from the API.
 */
var loadConfig = function (payload) {
    var requestId = payload.requestId;
    var config = payload.config;
    deriveImportMetadata(config);
    deriveImportRecords(config);
    var concepts = deriveConceptTree(config)
    console.log(metadata);
    console.log(records);
    console.log(concepts);
    return { requestId: requestId, result: concepts };
};
/*
 * Calculate counts for a given REDCap variable
 * (to be transformed into a Leaf Concept).
 */
var calculatePatientCount = function (payload) {
    var requestId = payload.requestId, concept = payload.concept;
    var urn = Object.assign({}, concept.urn, { value: undefined, instance: undefined });
    var universalId = urnToString(urn);
    var query = concept.urn.value
        ? function (r) { return r.id.startsWith(universalId) && r.valueNumber === concept.urn.value; }
        : function (r) { return r.id.startsWith(universalId); };
    var pats = records.filter(query).map(function (p) { return p.sourcePersonId; });
    var count = { value: new Set(pats).size };
    return { requestId: requestId, result: count };
};
var deriveImportMetadata = function (config) {
    var DESCRIPTIVE = 'descriptive';
    var NUMBER = 'number';
    var INTEGER = 'integer';
    var CALC = 'calc';
    var DATE = 'date';
    var exclude = new Set([DESCRIPTIVE]);
    var _loop_1 = function (i) {
        var field = config.metadata[i];
        var validation = field.text_validation_type_or_show_slider_number;
        var event_1 = void 0;
        /*
         * Skip if not an included field type.
         */
        if (exclude.has(field.field_type)) {
            return "continue";
        }
        /*
         * Try to match to an event, if applicable.
         */
        if (config.eventMappings) {
            var eventMap = config.eventMappings.find(function (em) { return em.form === field.form_name; });
            if (eventMap) {
                event_1 = eventMap.unique_event_name;
            }
        }
        var m = {
            form: field.form_name,
            name: field.field_name,
            source: field,
            urn: {
                project: config.projectInfo.project_id,
                form: field.form_name,
                field: field.field_name,
                event: event_1
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
        }
        else if (validation.indexOf(DATE) > -1) {
            m.isDate = true;
        }
        else {
            m.isString = true;
        }
        metadata.set(m.name, m);
    };
    for (var i = 0; i < config.metadata.length; i++) {
        _loop_1(i);
    }
};
/*
 * Derive useful Leaf-centric metadata for REDCap fields.
 * These are used only as an intermediate object on initial load.
 */
var deriveImportMetadata = function (config) {
    var DESCRIPTIVE = 'descriptive';
    var NUMBER = 'number';
    var INTEGER = 'integer';
    var CALC = 'calc';
    var DATE = 'date';
    var exclude = new Set([DESCRIPTIVE]);
    var _loop_1 = function (i) {
        var field = config.metadata[i];
        var validation = field.text_validation_type_or_show_slider_number;
        var event_1 = void 0;
        /*
         * Skip if not an included field type.
         */
        if (exclude.has(field.field_type)) {
            return "continue";
        }
        /*
         * Try to match to an event, if applicable.
         */
        if (config.eventMappings) {
            var eventMap = config.eventMappings.find(function (em) { return em.form === field.form_name; });
            if (eventMap) {
                event_1 = eventMap.unique_event_name;
            }
        }
        var m = {
            form: field.form_name,
            name: field.field_name,
            source: field,
            urn: {
                project: config.projectInfo.project_id,
                form: field.form_name,
                field: field.field_name,
                event: event_1
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
        }
        else if (validation.indexOf(DATE) > -1) {
            m.isDate = true;
        }
        else {
            m.isString = true;
        }
        metadata.set(m.name, m);
    };
    for (var i = 0; i < config.metadata.length; i++) {
        _loop_1(i);
    }
};
/*
 * Derive options within a REDCap field. In REDCap these are '|' and ',' delimited.
 */
var YESNO = 'yesno';
var TRUEFALSE = 'truefalse';
var DROPDOWN = 'dropdown';
var RADIO = 'radio';
var CHECKBOX = 'checkbox';
var TRUE = 'True';
var FALSE = 'False';
var YES = 'Yes';
var NO = 'No';
var OPTION_DELIMETER = '|';
var TEXT_VALUE_DELIMITER = ',';
var deriveFieldOptions = function (field) {
    var type = field.source.field_type;
    var choices = field.source.select_choices_or_calculations;
    if (type === YESNO) {
        return [{ text: YES, value: 1 }, { text: NO, value: 0 }];
    }
    if (type === TRUEFALSE) {
        return [{ text: TRUE, value: 1 }, { text: FALSE, value: 0 }];
    }
    if (type === DROPDOWN || type === RADIO || type === CHECKBOX) {
        return choices.split(OPTION_DELIMETER).map(function (opt) {
            var x = opt.split(TEXT_VALUE_DELIMITER);
            return { text: x[1].trim(), value: +x[0] };
        });
    }
    return [];
};
/*
 * Converts a REDCapUrn to a string, for the universalId.
 * Example: urn:leaf:concept:import:redcap:<project_id>:<form_name>:<field_name>:val=<value>&inst=<instance>
 */
var urnToString = function (urn) {
    var parts = ['urn', 'leaf', 'import', 'redcap', urn.project];
    var params = [];
    if (urn.form) {
        parts.push(urn.form);
    }
    if (urn.field) {
        parts.push(urn.field);
    }
    if (urn.value) {
        params.push("val=" + urn.value);
    }
    if (urn.instance) {
        params.push("inst=" + urn.instance);
    }
    if (params.length > 0) {
        parts.push(params.join('&'));
    }
    return parts.join(':');
};
var deriveImportRecords = function (config) {
    for (var i = 0; i < config.records.length; i++) {
        var raw = config.records[i];
        var field = metadata.get(raw.field_name);
        // console.log(raw, field);
        if (!field || raw.value === '') {
            continue;
        }
        var rec = {
            id: urnToString(__assign(__assign({}, field.urn), { instance: raw.redcap_repeat_instance })),
            sourcePersonId: raw.record,
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
            var d = new Date(rec.sourceValue);
            var y = d.getFullYear();
            if (d instanceof Date && !isNaN(y) && y > 1900 && y < 2100) {
                rec.valueDate = d;
            }
            else {
                continue;
            }
        }
        /*
         * Else if a number.
         */
        else if (field.isNumber) {
            var v = parseFloat(rec.sourceValue);
            if (v > 99999999 || v < -99999999) {
                continue;
            }
            rec.valueNumber = v;
        }
        records.push(rec);
    }
};
/*
 * Derive Leaf concepts based on REDCap project structure.
 */
var deriveConceptTree = function (config) {
    var urn = { project: config.projectInfo.project_id };
    var id = urnToString(urn);
    var text = 'Had data in REDCap Project ' + config.projectInfo.project_title + '"';
    var concepts = [];
    var root = {
        rootId: id,
        id: id,
        universalId: id,
        urn: urn,
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
    var byForm = deriveByFormConcept(root, config);
    concepts = byForm.concat([root]);
    if (config.projectInfo.is_longitudinal) {
        var byEvent = deriveByEventConcept(root, config);
        concepts = concepts.concat(byEvent);
    }
    /*
     * Load childrenIds for each parent.
     */
    var mapped = concepts.map(function (c) { return [c.id, c]; });
    var conceptMap = new Map(mapped);
    conceptMap.forEach(function (c) {
        if (c.parentId) {
            var p = conceptMap.get(c.parentId);
            if (p) {
                p.childrenIds.add(c.id);
            }
        }
    });
    return [ ...conceptMap.values() ];
};
/*
 * Derive a REDCap Concept structure based on:
 * By Event => Event1, Event2 ...
 */
var deriveByEventConcept = function (root, config) {
    var idMod = 'event';
    var concept = Object.assign({}, root, { id: root.universalId + ":" + idMod, parentId: root.id, childrenIds: new Set(), uiDisplayName: 'By Event' });
    return config.events
        .map(function (e) { return deriveEventConcept(concept, e.event_name, idMod, config); })
        .reduce(function (a, b) { return a.concat(b); }, [])
        .concat([concept]);
};
/*
 * Derive a REDCap Concept structure based on:
 * By Form => Form1, Form2 ...
 */
var deriveByFormConcept = function (root, config) {
    var idMod = 'form';
    var concept = Object.assign({}, root, { id: root.universalId + ":" + idMod, parentId: root.id, childrenIds: new Set(), uiDisplayName: 'By Form' });
    return config.forms
        .map(function (f) { return deriveFormConcept(concept, f.instrument_name, idMod); })
        .reduce(function (a, b) { return a.concat(b); }, [])
        .concat([concept]);
};
/*
 * Derive a REDCap Concept structure based on:
 * Event => Form1, Form2 ...
 */
var deriveEventConcept = function (parent, event, idMod, config) {
    var urn = Object.assign({}, parent.urn, { event: event });
    var universalId = urnToString(urn);
    var concept = Object.assign({}, parent, { id: universalId + ":" + idMod, universalId: universalId, urn, parentId: parent.id, childrenIds: new Set(), uiDisplayName: event, uiDisplayText: parent.uiDisplayText + ' event "' + event + '"' });
    return config.eventMappings
        .filter(function (em) { return em.unique_event_name === event; })
        .map(function (f) { return deriveFormConcept(concept, f.form, idMod); })
        .reduce(function (a, b) { return a.concat(b); }, [])
        .concat([concept]);
};
/*
 * Derive a REDCap Concept structure based on:
 * Form => Field1, Field2 ...
 */
var deriveFormConcept = function (parent, form, idMod) {
    var urn = Object.assign({}, parent.urn, { form: form });
    var universalId = urnToString(urn);
    var concept = Object.assign({}, parent, { id: universalId + ":" + idMod, universalId: universalId, urn, parentId: parent.id, childrenIds: new Set(), uiDisplayName: form, uiDisplayText: parent.uiDisplayText + ' form "' + form + '"' });
    return [ ...metadata.values() ].filter(function (f) { return f.form === form; })
        .map(function (f) { return deriveFieldConcept(concept, f, idMod); })
        .reduce(function (a, b) { return a.concat(b); }, [])
        .concat([concept]);
};
/*
 * Derive a REDCap Concept structure based on:
 * Field => Option1?, Option2? ...
 */
var deriveFieldConcept = function (parent, field, idMod) {
    var urn = Object.assign({}, parent.urn, { field: field.id });
    var universalId = urnToString(urn);
    var concept = Object.assign({}, parent, { id: universalId + ":" + idMod, universalId: universalId, urn, parentId: parent.id, isParent: field.options.length > 0, isEncounterBased: field.isDate, childrenIds: new Set(), uiDisplayName: field.name, uiDisplayText: parent.uiDisplayText + ' field "' + field.name + '"' });
    return field.options
        .map(function (op) { return deriveFieldOptionConcept(concept, op, idMod); })
        .concat([concept]);
};
/*
 * Derive a REDCapConcept for an option within a field.
 */
var deriveFieldOptionConcept = function (parent, option, idMod) {
    var urn = Object.assign({}, parent.urn, { value: option.value });
    var universalId = urnToString(urn);
    return Object.assign({}, parent, { id: universalId + ":" + idMod, universalId: universalId, urn, parentId: parent.id, isParent: false, isEncounterBased: false, childrenIds: new Set(), uiDisplayName: option.text, uiDisplayText: parent.uiDisplayText + ' of "' + option.text + '"' });
};
`