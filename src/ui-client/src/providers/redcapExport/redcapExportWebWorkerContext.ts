/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
var handleWorkMessage = function (payload) {
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
var invalid = new Set([' ', '-', '.', ';', ',', '!', ':', '[', ']', '{', '}', '>', '<', '=', '(', ')', '/', ]);
var cleanName = function (pre, charLimit) {
    var arr = [];
    for (var i = 0; i < pre.length; i++) {
        var t = pre[i];
        if (!invalid.has(t)) {
            arr.push(t);
        }
    }
    var name = arr.join('').toLowerCase();
    /*
     * If the name is too long, generate a random integer,
     * shorten the name, and append the integer to keep the name unique.
     */
    if (name.length > charLimit) {
        var rand = "" + Math.round(Math.random() * 1000000);
        return name.substring(0, charLimit - rand.length - 1) + "_" + rand;
    }
    return name;
};
/*
 * Create a unique REDCap project export configuration
 * based on data from the patient list.
 */
var createExportConfiguration = function (payload) {
    var requestId = payload.requestId, options = payload.options, patientList = payload.patientList, projectTitle = payload.projectTitle, username = payload.username, useRepeatingForms = payload.useRepeatingForms;
    var dsNameLenLimit = 64;
    /*
     * Ensure the id generate for each dataset in REDCap has
     * only valid characters and is wiithin the length limit.
     */
    patientList.forEach(function (d) { return d.datasetId = cleanName(d.datasetId, dsNameLenLimit); });
    /*
     * Marshall the data to configure and populate the project.
     */
    var derived = deriveRecords(patientList, useRepeatingForms, options.rowLimit);
    var config = {
        data: derived.records,
        metadata: deriveFieldMetadata(derived),
        project: {
            is_longitudinal: "'" + (useRepeatingForms ? 0 : 1) + "'",
            project_title: projectTitle,
            record_autonumbering_enabled: '0',
        },
        users: [deriveUser(options, patientList, username)]
    };
    /*
     * Only use repeating forms if the target version of REDCap supports them.
     */
    if (useRepeatingForms) {
        config.repeatingFormEvents = deriveRepeatingFormsEvents(derived);
    }
    else {
        var ev = deriveEvents(derived);
        config.eventMappings = ev.eventMappings;
        config.events = ev.events;
    }
    return { requestId: requestId, result: config };
};
/**
 * Remove any characters which may possibly blow up REDCap JSON decoding
 */
var toREDCapValue = function(val) {
    if (typeof val === 'string') {
        return val.replace('&',' ');
    }
    return val;
}
/*
 * Create a superset object of PatientListDatasetExport[]
 * which includes a derived field_name for REDCap
 * and and a single array of records derived from
 * all patient list datasets.
 */
var deriveRecords = function (pl, useRepeatingForms, rowLimit) {
    var _a;
    var colRcPersonId = personId.toLowerCase();
    var colRcEventName = 'redcap_event_name';
    var colRcRepeatInstrument = 'redcap_repeat_instrument';
    var colRcRepeatInstance = 'redcap_repeat_instance';
    var derived = { datasets: pl, records: [] };
    var recordCompleteStateCode = 2;
    var fieldNameLenLimit = 100;
    var totalRowCount = 0;
    var totalRowLimitReached = false;
    var personIdAdded = false;
    /*
     * For each dataset.
     */
    for (var i = 0; i < derived.datasets.length; i++) {
        var ds = derived.datasets[i];
        var colRcCompleted = ds.datasetId + "_complete";
        var recordCount = new Map();
        var cols = [];
        /*
         * Update column names by appending datasetId to avoid collisions in REDCap.
         */
        for (var j = 0; j < ds.columns.length; j++) {
            var col = ds.columns[j];
            col.redcapFieldName = cleanName(ds.datasetId + "_" + col.id, fieldNameLenLimit);
            if (col.id !== personId || (col.id === personId && !personIdAdded)) {
                if (col.id === personId) {
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
        for (var k = 0; k < ds.data.length; k++) {
            var r = ds.data[k];
            var patientId = r[personId];
            if (patientId) {
                var count = recordCount.get(patientId) || 0;
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
                var record = (_a = {}, _a[colRcPersonId] = r[personId], _a[colRcCompleted] = recordCompleteStateCode, _a);
                if (useRepeatingForms && ds.isMultirow) {
                    record[colRcRepeatInstrument] = ds.datasetId;
                    record[colRcRepeatInstance] = count;
                }
                else if (!useRepeatingForms) {
                    record[colRcEventName] = "" + ds.datasetId + count + "_arm_1";
                }
                for (var l = 0; l < ds.columns.length; l++) {
                    var rcCol = ds.columns[l];
                    var val = r[rcCol.id];
                    if (val) {
                        record[rcCol.redcapFieldName] = (rcCol.type === typeDate ? toREDCapDate(val) : toREDCapValue(val));
                    }
                }
                derived.records.push(record);
            }
            totalRowCount++;
            totalRowLimitReached = rowLimit > 0 && totalRowCount >= rowLimit;
            if (totalRowLimitReached)
                break;
        }
        if (totalRowLimitReached)
            break;
    }
    return derived;
};
/*
 * Derive unique events (e.g., diagnosis1, diagnosis2) and
 * the REDCap event mappings to point them to specific forms.
 * (1 Patient List Dataset => 1 REDCap Form)
 */
var deriveEvents = function (pl) {
    var events = [];
    var eventMappings = [];
    for (var i = 0; i < pl.datasets.length; i++) {
        var ds = pl.datasets[i];
        for (var j = 1; j <= ds.maxRows; j++) {
            var eventName = ("" + ds.datasetId + j).toLowerCase();
            var uniqueEventNameArm = eventName + "_arm_1";
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
    return { events: events, eventMappings: eventMappings };
};
/*
 * Derive metadata from Patient List Dataset fields
 * from REDCap. Each column in each dataset becomes
 * a field.
 */
var deriveFieldMetadata = function (pl) {
    var meta = [];
    /*
     * Of note, REDCap expects the properties to be
     * in exactly the below order (and throws if not).
     */
    for (var i = 0; i < pl.datasets.length; i++) {
        var ds = pl.datasets[i];
        for (var j = 0; j < ds.columns.length; j++) {
            var col = ds.columns[j];
            var field = {
                field_name: col.redcapFieldName,
                form_name: ds.datasetId,
                section_header: '',
                field_type: 'text',
                field_label: capitalize(col.id),
                select_choices_or_calculations: '',
                field_note: '',
                text_validation_type_or_show_slider_number: col.type === typeNum ? 'number' :
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
};
/*
 * Derive repeating forms events.
 */
var deriveRepeatingFormsEvents = function (pl) {
    var repeatingForms = [];
    for (var i = 0; i < pl.datasets.length; i++) {
        var ds = pl.datasets[i];
        if (ds.isMultirow) {
            var form = { form_name: ds.datasetId };
            if (ds.dateValueColumn) {
                form.custom_form_label = ("[" + ds.datasetId + "_" + ds.dateValueColumn + "]").toLowerCase();
            }
            repeatingForms.push(form);
        }
    }
    return repeatingForms;
};
/*
 * Derive a user JSON object. The Leaf user
 * is designated as the owner of the new REDCap project.
 */
var deriveUser = function (options, patientList, username) {
    var forms = {};
    patientList.forEach(function (d) { return forms[d.datasetId] = 1; });
    var user = {
        username: options.includeScopeInUsername ? username + "@" + options.scope : username,
        email: "",
        firstname: 'Project',
        lastname: 'Owner',
        expiration: '',
        data_access_group: '',
        data_access_group_id: '',
        design: 1,
        user_rights: 1,
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
        forms: forms
    };
    return user;
};
var capitalize = function (colName) {
    return colName.charAt(0).toUpperCase() + colName.slice(1).trim();
};
var toREDCapDate = function (date) {
    if (!date) {
        return '';
    /*
     * Shouldn't happen but sanity check just in case it's a string.
     */ 
    } else if (typeof date === 'string') {
        date = new Date(date)
        if (isNaN(date.getTime())) {
            return '';
        }
    }
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var strMinutes = minutes < 10 ? '0' + minutes : minutes;
    var strHours = hours < 10 ? '0' + hours : hours;
    var strTime = strHours + ":" + strMinutes + ":00";
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + strTime;
};
`;