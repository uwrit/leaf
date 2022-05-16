/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2)
        for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar)
                    ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// eslint-disable-next-line
var handleWorkMessage = function (payload) {
    switch (payload.message) {
        case TRANSFORM:
            return transform(payload);
        case GET_COHORT_MEAN:
            return getCohortMean(payload);
        default:
            return null;
    }
};
var cohortData = { patients: new Map(), metadata: new Map(), comparison: new Map() };
var datasets;
var getCohortMean = function (payload) {
    var filters = payload.filters, dimensions = payload.dimensions, sourcePatId = payload.sourcePatId, requestId = payload.requestId;
    var result = { values: new Map(), n: 0 };
    var matches = getMatchingPatients(filters, sourcePatId);
    result.n = matches.length;
    console.log(matches);

    for (var dim of dimensions) {
        var mean = getMeanValue(matches, dim);
        result.values.set(dim.ds.id, mean);
    }
    return { result: result, requestId: requestId };
};
var getMeanValue = function (patIds, dim) {
    var n = 0;
    var sum = 0.0;
    for (var _i = 0, patIds_1 = patIds; _i < patIds_1.length; _i++) {
        var p = patIds_1[_i];
        var d = cohortData.patients.get(p);
        var ds = d.datasets.get(dim.ds.id);
        if (ds) {
            var vals = ds.filter(function (x) { return x[dim.cols.fieldValueNumeric]; });
            if (vals.length) {
                n++;
                sum += vals[vals.length - 1][dim.cols.fieldValueNumeric];
            }
        }
    }
    return sum / n;
};
var getMatchingPatients = function (filters, sourcePatId) {
    var elig = new Map(cohortData.patients);
    var sourcePat = cohortData.patients.get(sourcePatId);
    var all = function () { return [ ...cohortData.patients.keys() ]; };
    var matcher;
    if (!sourcePat)
        return all();
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
var matchString = function (filter, sourcePat) {
    var defaultMatchFunc = function (pat) { return true; };
    var matchOn = new Set();
    var matchUnq = 1;
    if (filter.args && filter.args.string && filter.args.string.matchOn && filter.args.string.matchOn.length > 0) {
        matchOn = new Set(filter.args.string.matchOn);
        matchUnq = matchOn.size;
    }
    else {
        var ds = sourcePat.datasets.get(filter.datasetId);
        if (!ds)
            return defaultMatchFunc;
        var val = ds.find(function (r) { return r[filter.column]; });
        if (!val)
            return defaultMatchFunc;
        matchOn = new Set([val[filter.column]]);
    }
    return function (pat) {
        var ds = pat.datasets.get(filter.datasetId);
        if (!ds)
            return false;
        var vals = ds.filter(function (r) { return matchOn.has(r[filter.column]); }).map(function (r) { return r[filter.column]; });
        if (vals.length === 0)
            return false;
        var unq = new Set(vals).size;
        if (unq === matchUnq)
            return true;
        return false;
    };
};
var matchNum = function (filter, sourcePat) {
    var defaultMatchFunc = function (pat) { return true; };
    var ds = sourcePat.datasets.get(filter.datasetId);
    if (!ds)
        return defaultMatchFunc;
    var val = ds.find(function (r) { return r[filter.column]; });
    if (!val)
        return defaultMatchFunc;
    var boundLow = val[filter.column];
    var boundHigh = boundLow;
    if (filter.args && filter.args.numeric && filter.args.numeric.pad) {
        boundLow -= filter.args.numeric.pad;
        boundHigh += filter.args.numeric.pad;
    }
    return function (pat) {
        var ds = pat.datasets.get(filter.datasetId);
        if (!ds)
            return false;
        var val = ds.find(function (r) { return r[filter.column] >= boundLow && r[filter.column] <= boundHigh; });
        if (!val)
            return false;
        return true;
    };
};
var transform = function (payload) {
    var data = payload.data, demographics = payload.demographics, requestId = payload.requestId;
    cohortData = { patients: new Map(), metadata: new Map(), comparison: new Map() };
    datasets = new Map();
    for (var _i = 0, _a = demographics; _i < _a.length; _i++) {
        var row = _a[_i];
        cohortData.patients.set(row.personId, { id: row.personId, demographics: row, datasets: new Map() });
    }
    ;
    for (var _b = 0, _c = data; _b < _c.length; _b++) {
        var pair = _c[_b];
        var _d = pair, dsRef = _d[0], dataset = _d[1];
        var meta = { ref: dsRef, schema: dataset.schema };
        var dateFields = dataset.schema.fields.filter(function (field) { return field.type === typeDate; }).map(function (field) { return field.name; });
        datasets.set(dsRef.id, [dsRef, dataset]);
        for (var _e = 0, _f = Object.keys(dataset.results); _e < _f.length; _e++) {
            var patientId = _f[_e];
            var rows = dataset.results[patientId];
            var patient = cohortData.patients.get(patientId);
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
            patient.id = patientId;
            patient.datasets.set(dsRef.id, rows);
            patient.datasets.set("demographics", [patient.demographics]);
            cohortData.patients.set(patientId, patient);
            cohortData.metadata.set(dsRef.id, meta);
        }
    }
    return { result: cohortData, requestId: requestId };
};
/**
 * Parse a string timestamp. More info at https://github.com/uwrit/leaf/issues/418
 */
var parseTimestamp = function (timestampStr) {
    var _date = new Date(timestampStr);
    return new Date(_date.getTime() + (_date.getTimezoneOffset() * 60 * 1000));
};
`;