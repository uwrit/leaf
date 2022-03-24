/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
"use strict";
// eslint-disable-next-line
var handleWorkMessage = function (payload) {
    switch (payload.message) {
        case TRANSFORM:
            return transform(payload);
        default:
            return null;
    }
};
var transform = function (payload) {
    var data = payload.data, demographics = payload.demographics, requestId = payload.requestId;
    var result = { patients: new Map(), metadata: new Map() };
    for (var _i = 0, _a = demographics; _i < _a.length; _i++) {
        var row = _a[_i];
        result.patients.set(row.personId, { demographics: row, datasets: new Map() });
    }
    ;
    var _loop_1 = function (pair) {
        var _d = pair, dsRef = _d[0], dataset = _d[1];
        var meta = { ref: dsRef, schema: dataset.schema };
        var dateFields = dataset.schema.fields.filter(function (field) { return field.type === typeDate; }).map(function (field) { return field.name; });
        for (var _e = 0, _f = Object.keys(dataset.results); _e < _f.length; _e++) {
            var patientId = _f[_e];
            var rows = dataset.results[patientId];
            var patient = result.patients.get(patientId);
            // Convert strings to dates
            for (var j = 0; j < rows.length; j++) {
                var row = rows[j];
                for (var k = 0; k < dateFields.length; k++) {
                    var f = dateFields[k];
                    var v = row[f];
                    if (v) {
                        row[f] = parseTimestamp(v);
                        row.__dateunix__ = row[f].valueOf();
                    }
                }
            }
            rows = rows.sort((function (a, b) { return a.__dateunix__ - b.__dateunix__; }));
            patient.datasets.set(dsRef.id, rows);
            result.patients.set(patientId, patient);
            result.metadata.set(dsRef.id, meta);
        }
    };
    for (var _b = 0, _c = data; _b < _c.length; _b++) {
        var pair = _c[_b];
        _loop_1(pair);
    }
    return { result: result, requestId: requestId };
};
/**
 * Parse a string timestamp. More info at https://github.com/uwrit/leaf/issues/418
 */
var parseTimestamp = function (timestampStr) {
    var _date = new Date(timestampStr);
    return new Date(_date.getTime() + (_date.getTimezoneOffset() * 60 * 1000));
};
`;