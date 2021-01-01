/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
console.log('timelines worker up');
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
var indexDataset = { patients: new Map() };
var conceptDatasetMap = new Map();
// eslint-disable-next-line
var handleWorkMessage = function (payload) {
    switch (payload.message) {
        case QUERY:
            return query(payload);
        case ADD_CONCEPT_DATASET:
            return addConceptDataset(payload);
        case ADD_INDEX_DATASET:
            return addIndexDataset(payload);
        case REMOVE_CONCEPT_DATASET:
            return removeConceptDataset(payload);
        case CLEAR_DATA:
            return clearData(payload);
        default:
            return null;
    }
};
var query = function (payload) {
    if (payload.config.mode === configQueryAggregate) {
        return { requestId: payload.requestId, result: queryAggregate(payload) };
    }
    else {
        return null;
    }
};
/**
 * Query aggregate
 */
var queryAggregate = function (payload) {
    var config = payload.config;
    var output = { concepts: new Map() };
    var bins = getTimeBins(config);
    var dateDiffer = getDateDiffFunc(config);
    var totalPats = indexDataset.patients.size;
    // Foreach concept
    conceptDatasetMap.forEach(function (v, k) {
        var data = getAggregateCounts(totalPats, v.concept, bins, dateDiffer);
        output.concepts.set(k, { concept: v.concept, data: data });
    });
    return output;
};
"use strict";
/**
         * Aggregate counts relative to index date
         */
var getAggregateCounts = function (totalPats, concept, bins, dateDiffer) {
    var output = [];
    var conceptData = conceptDatasetMap.get(concept.id);
    if (!conceptData) {
        return output;
    }
    var pats = [ ...conceptData.patients.values() ];
    // For each bin
    bins.forEach(function (bin) {
        var binCount = 0;
        var _loop_1 = function (i) {
            var p = pats[i];
            var idxp = indexDataset.patients.get(p.compoundId);
            if (!idxp || !idxp.initialDate) {
                return "continue";
            }
            var indexDate = idxp.initialDate;
            var d = void 0;
            if (typeof (bin.minNum) === 'undefined') {
                d = p.rows.find(function (r) { return r.dateField && dateDiffer(r.dateField, indexDate) < bin.maxNum; });
            }
            else if (typeof (bin.maxNum) === 'undefined') {
                d = p.rows.find(function (r) { return r.dateField && dateDiffer(r.dateField, indexDate) > bin.minNum; });
            }
            else {
                d = p.rows.find(function (r) {
                    if (!r.dateField) {
                        return false;
                    }
                    var diff = dateDiffer(r.dateField, indexDate);
                    if (diff >= bin.minNum && diff <= bin.maxNum) {
                        return true;
                    }
                    return false;
                });
            }
            if (d) {
                binCount += 1;
            }            
        };
        // For each patient
        for (var i = 0; i < pats.length; i++) {
            _loop_1(i);
        }
        var values = { percent: (binCount / totalPats), size: getCohortBinSize(binCount, totalPats), total: binCount };
        var dataRow = {
            conceptId: concept.id,
            timepointId: bin.label,
            displayValueX: values.size,
            displayValueY: 1,
            values: values
        };
        output.push(dataRow);
    });
    return output;
};
/**
 * Get cohort bin size
 */
var getCohortBinSize = function (binTotal, cohortTotal) {
    if (cohortTotal === 0) {
        return 0;
    }
    var proportion = binTotal / cohortTotal * 100.0;
    if (proportion < 20) {
        return 1;
    }
    else if (proportion < 40) {
        return 2;
    }
    else if (proportion < 60) {
        return 3;
    }
    else if (proportion < 80) {
        return 4;
    }
    return 5;
};
/**
 * Get datediff function
 */
var getDateDiffFunc = function (config) {
    var type = config.dateIncrement.incrementType;
    var multiplier = 1000;
    switch (type) {
        case dateIncrementMinute:
            multiplier = (1000 * 60);
            break;
        case dateIncrementHour:
            multiplier = (1000 * 60 * 60);
            break;
        case dateIncrementDay:
            multiplier = (1000 * 60 * 60 * 24);
            break;
        case dateIncrementWeek:
            multiplier = (1000 * 60 * 60 * 24 * 7);
            break;
        case dateIncrementMonth:
            multiplier = (1000 * 60 * 60 * 24 * 30);
            break;
        case dateIncrementYear:
            multiplier = (1000 * 60 * 60 * 24 * 365);
            break;
    }
    return function (rowDate, initialDate) { return ((rowDate.getTime() - initialDate.getTime()) / multiplier); };
};
/**
 * Get Timebins
 */
var getTimeBins = function (config) {
    var maxBins = 5;
    var bins = [];
    var incr = config.dateIncrement.increment;
    var startBin;
    var lastBin;
    var lowerBound = 0;
    var upperBound = 0;
    var currIdx = incr;
    // After
    if (config.dateIncrement.mode === dateDisplayModeAfter) {
        lowerBound = 0;
        upperBound = incr * maxBins;
        startBin = { label: "<" + incr, minNum: 1, maxNum: incr };
        lastBin = { label: ">" + upperBound, minNum: upperBound };
    }
    // Before
    else if (config.dateIncrement.mode === dateDisplayModeBefore) {
        lowerBound = -(incr * maxBins);
        currIdx = lowerBound + incr;
        startBin = { label: "<" + lowerBound, maxNum: -1 };
        lastBin = { label: "", minNum: 0 };
    }
    // Before & After
    else {
        lowerBound = Math.trunc((incr * maxBins / 2));
        upperBound = -lowerBound;
        currIdx = lowerBound + incr;
        startBin = { label: "<" + lowerBound, maxNum: lowerBound + incr };
        lastBin = { label: "", minNum: -incr };
    }
    while (currIdx < upperBound) {
        bins.push({ label: currIdx + "-" + (currIdx + incr), minNum: currIdx, maxNum: currIdx + incr });
        currIdx += incr;
    }
    bins.unshift(startBin);
    bins.push(lastBin);
    return bins;
};
/**
 * Clear all data
 */
var clearData = function (payload) {
    conceptDatasetMap = new Map();
    indexDataset = { patients: new Map() };
    return { requestId: payload.requestId };
};
/**
 * Remove concept dataset
 */
var removeConceptDataset = function (payload) {
    var concept = payload.concept;
    conceptDatasetMap.delete(concept.id);
    return { requestId: payload.requestId };
};
/**
 *  Add concept dataset
 */
var addConceptDataset = function (payload) {
    var responderId = payload.responderId;
    var dataset = payload.dataset;
    var concept = payload.concept;
    var uniquePatients = Object.keys(dataset.results);
    var store;
    if (!conceptDatasetMap.has(concept.id)) {
        store = {
            concept: concept,
            patients: new Map()
        };
        conceptDatasetMap.set(concept.id, store);
    }
    else {
        store = conceptDatasetMap.get(concept.id);
    }
    // For each row
    for (var i = 0; i < uniquePatients.length; i++) {
        var p = uniquePatients[i];
        var rows = dataset.results[p];
        var compoundId = responderId + "_" + p;
        // Convert to ConceptDatasetRow
        var convRows = [];
        for (var k = 0; k < rows.length; k++) {
            var row = rows[k];
            var convRow = __assign({}, row, { dateField: row.dateField ? new Date(row.dateField) : undefined });
            convRows.push(convRow);
        }
        var pat = { compoundId: compoundId, id: p, responderId: responderId, rows: convRows };
        store.patients.set(compoundId, pat);
    }
    return { requestId: payload.requestId };
};
/**
 *  Add index dataset
 */
var addIndexDataset = function (payload) {
    var responderId = payload.responderId;
    var dataset = payload.dataset;
    var uniquePatients = Object.keys(dataset.results);
    // For each row
    for (var i = 0; i < uniquePatients.length; i++) {
        var p = uniquePatients[i];
        var rows = dataset.results[p];
        var compoundId = responderId + "_" + p;
        // Convert to ConceptDatasetRow
        var convRows = [];
        var initialDate = void 0;
        var finalDate = void 0;
        for (var k = 0; k < rows.length; k++) {
            var row = rows[k];
            var convRow = __assign({}, row, { dateField: row.dateField ? new Date(row.dateField) : undefined });
            if (convRow.dateField) {
                if (!initialDate || convRow.dateField < initialDate) {
                    initialDate = convRow.dateField;
                }
                if (!finalDate || convRow.dateField > finalDate) {
                    finalDate = convRow.dateField;
                }
            }
            convRows.push(convRow);
        }
        var pat = { compoundId: compoundId, id: p, responderId: responderId, rows: convRows, initialDate: initialDate, finalDate: finalDate };
        indexDataset.patients.set(compoundId, pat);
    }
    return { requestId: payload.requestId };
};
`;