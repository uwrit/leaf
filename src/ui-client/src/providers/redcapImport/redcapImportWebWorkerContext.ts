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
var config;
var metadata;
var records = [];
/*
 * Load the raw REDCap project data from the API.
 */
var loadConfig = function (payload) {
    var requestId = payload.requestId;
    config = payload.config;
    deriveImportRecords(config);
    var concepts = deriveConceptTree(config);
    return { requestId: requestId, result: concepts };
};
/*
 * Calculate counts for a given REDCap variable
 * (to be transformed into a Leaf Concept).
 */
var calculatePatientCount = function (payload) {
    var requestId = payload.requestId, field_name = payload.field_name, search_value = payload.search_value;
    var data = config;
    var field = metadata.get(field_name);
    if (!field) {
        return { requestId: requestId, result: { value: 0 } };
    }
    var query = search_value
        ? function (r) { return r.field_name === field_name && r.value === search_value.toString(); }
        : function (r) { return r.field_name === field_name; };
    var pats = data.records.filter(query).map(function (p) { return p.record; });
    var count = { value: new Set(pats).size };
    return { requestId: requestId, result: count };
};
/*
 * Derive useful Leaf-centric metadata for REDCap fields.
 * These are used only as an intermediate object on intial load.
 */
var deriveImportMetadata = function (config) {
    var meta = new Map();
    var DESCRIPTIVE = 'descriptive';
    var NUMBER = 'number';
    var INTEGER = 'integer';
    var CALC = 'calc';
    var DATE = 'date';
    var _loop_1 = function (i) {
        var field = config.metadata[i];
        var validation = field.text_validation_type_or_show_slider_number;
        var event_1 = void 0;
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
            include: field.field_type !== DESCRIPTIVE,
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
        if (validation === NUMBER || validation === INTEGER || validation === CALC) {
            m.isNumber = true;
        }
        else if (validation.indexOf(DATE) > -1) {
            m.isDate = true;
        }
        else {
            m.isString = true;
        }
        meta.set(m.name, m);
    };
    for (var i = 0; i < config.metadata.length; i++) {
        _loop_1(i);
    }
    metadata = meta;
    return meta;
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
    var parts = ['urn', 'leaf', 'concept', 'import', 'redcap', urn.project];
    var options = [];
    if (urn.form) {
        parts.push(urn.form);
    }
    if (urn.field) {
        parts.push(urn.field);
    }
    if (urn.value) {
        options.push("val=" + urn.value);
    }
    if (urn.instance) {
        options.push("inst=" + urn.instance);
    }
    if (options.length > 0) {
        parts.push(options.join('&'));
    } 
    return parts.join(':');
};
var deriveImportRecords = function (payload) {
    var meta = deriveImportMetadata(config);
    var recs = [];
    for (var i = 0; i < config.records.length; i++) {
        var raw = config.records[i];
        var field = meta.get(raw.field_name);
        if (!field || raw.value === '') {
            continue;
        }
        var rec = {
            id: urnToString({ ...field.urn, instance: raw.redcap_repeat_instance }),
            sourcePersonId: raw.record,
            sourceValue: raw.value.toString()
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
        recs.push(rec);
    }
    records = recs;
};
/*
 * Derive Leaf concepts based on REDCap project structure.
 */
var deriveConceptTree = function (config) {
    var urn = { project: config.projectInfo.project_id };
    var id = urnToString(urn);
    var text = 'Had data in REDCap Project "' + config.projectInfo.project_title + '"';
    var concepts = [];
    var root = {
        rootId: id,
        id: id,
        universalId: id,
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
    var byForm = deriveByFormConcept(root, urn, config);
    concepts = byForm.concat([root]);
    if (config.projectInfo.is_longitudinal) {
        var byEvent = deriveByEventConcept(root, urn, config);
        concepts = concepts.concat(byEvent);
    }
    console.log(concepts);
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
    return conceptMap;
};
/*
 * Derive a REDCap Concept structure based on:
 * By Event => Event1, Event2 ...
 */
var deriveByEventConcept = function (root, rootUrn, config) {
    var idMod = 'event';
    var concept = { ...root, id: root.universalId + ":" + idMod, parentId: root.id, childrenIds: new Set(), uiDisplayName: 'By Event' };
    var children = config.events.map(function (e) { return deriveEventConcept(concept, rootUrn, e.event_name, idMod, config); });
    return children
        .reduce(function (a, b) { return a.concat(b); },[])
        .concat([concept]);
};
/*
 * Derive a REDCap Concept structure based on:
 * By Form => Form1, Form2 ...
 */
var deriveByFormConcept = function (root, rootUrn, config) {
    var idMod = 'form';
    var concept = { ...root, id: root.universalId + ":" + idMod, parentId: root.id, childrenIds: new Set(), uiDisplayName: 'By Form' };
    var children = config.forms.map(function (f) { return deriveFormConcept(concept, rootUrn, f.instrument_name, idMod); });
    return children
        .reduce(function (a, b) { return a.concat(b); },[])
        .concat([concept]);
};
/*
 * Derive a REDCap Concept structure based on:
 * Event => Form1, Form2 ...
 */
var deriveEventConcept = function (parent, parentUrn, event, idMod, config) {
    var urn = { ...parentUrn, event: event };
    var universalId = urnToString(urn);
    var concept = { ...parent, id: universalId + ":" + idMod, universalId: universalId, parentId: parent.id, childrenIds: new Set(), uiDisplayName: event, uiDisplayText: parent.uiDisplayText + ' event "' + event + "'" };
    var children = config.eventMappings
        .filter(function (em) { return em.unique_event_name === event; })
        .map(function (f) { return deriveFormConcept(concept, urn, f.form, idMod); });
    return children
        .reduce(function (a, b) { return a.concat(b); },[])
        .concat([concept]);
};
/*
 * Derive a REDCap Concept structure based on:
 * Form => Field1, Field2 ...
 */
var deriveFormConcept = function (parent, parentUrn, form, idMod) {
    var urn = { ...parentUrn, form: form };
    var universalId = urnToString(urn);
    var concept = { ...parent, id: universalId + ":" + idMod, universalId: universalId, parentId: parent.id, childrenIds: new Set(), uiDisplayName: form, uiDisplayText: parent.uiDisplayText + ' form "' + form + '"'};
    var children = [ ...metadata.values() ].filter(function (f) { return f.form === form; })
        .map(function (f) { return deriveFieldConcept(concept, urn, f, idMod); });
    return children
        .reduce(function (a, b) { return a.concat(b); },[])
        .concat([concept]);
};
/*
 * Derive a REDCap Concept structure based on:
 * Field => Option1?, Option2? ...
 */
var deriveFieldConcept = function (parent, parentUrn, field, idMod) {
    var urn = { ...parentUrn, field: field.name };
    var universalId = urnToString(urn);
    var concept = { ...parent, id: universalId + ":" + idMod, universalId: universalId, parentId: parent.id, isParent: field.options.length > 0, childrenIds: new Set(), isEncounterBased: field.isDate, uiDisplayName: field.name, uiDisplayText: parent.uiDisplayText + ' field "' + field.name + '"' };
    var children = field.options.map(function (op) { return deriveFieldOptionConcept(concept, urn, op, idMod); });
    return children.concat([concept]);
};
/*
 * Derive a REDCap Concept for an option within a field.
 */
var deriveFieldOptionConcept = function (parent, parentUrn, option, idMod) {
    var urn = { ...parentUrn, value: option.value };
    var universalId = urnToString(urn);
    return { ...parent, id: universalId + ":" + idMod, universalId: universalId, parentId: parent.id, isParent: false, childrenIds: new Set(), isEncounterBased: false, uiDisplayName: option.text, uiDisplayText: parent.uiDisplayText + ' of "' + option.text + '"' };
};
`