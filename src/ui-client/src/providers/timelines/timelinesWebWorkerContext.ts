/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
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
    if (totalPats === 0) {
        return output;
    }
    // Foreach concept
    conceptDatasetMap.forEach(function (v, k) {
        var concept = v.panel.subPanels[0].panelItems[0].concept;
        var data = getAggregateCounts(totalPats, config, concept, bins, dateDiffer);
        output.concepts.set(k, { panel: v.panel, data: data });
    });
    return output;
};
/**
 * Aggregate counts relative to index date
 */
var getAggregateCounts = function (totalPats, config, concept, bins, dateDiffer) {
    var output = [];
    var conceptData = conceptDatasetMap.get(concept.id);
    if (!conceptData) {
        return output;
    }
    var pats = [ ...conceptData.patients.values() ];
    var afterMatchHandler = config.firstEventOnly
        ? function (i) { pats.splice(i, 1); }
        : function (i) { return null; };
    var _loop_1 = function (bi) {
        // If placeholder for index date
        var bin = bins[bi];
        if (bin === null) {
            output.push(null);
            return "continue";
        }
        var binCount = 0;
        var _loop_2 = function (i) {
            var p = pats[i];
            var idxp = indexDataset.patients.get(p.compoundId);
            if (!idxp || !idxp.initialDate) {
                return "continue";
            }
            var indexDate_1 = idxp.initialDate;
            var d = void 0;
            if (typeof (bin.minNum) === 'undefined') {
                d = p.rows.find(function (r) { return r.dateField && dateDiffer(r.dateField, indexDate_1) < bin.maxNum; });
            }
            else if (typeof (bin.maxNum) === 'undefined') {
                d = p.rows.find(function (r) { return r.dateField && dateDiffer(r.dateField, indexDate_1) > bin.minNum; });
            }
            else {
                d = p.rows.find(function (r) {
                    if (!r.dateField) {
                        return false;
                    }
                    var diff = dateDiffer(r.dateField, indexDate_1);
                    if (diff >= bin.minNum && diff < bin.maxNum) {
                        return true;
                    }
                    return false;
                });
            }
            if (d) {
                binCount += 1;
                afterMatchHandler(i);
            }
        };
        // For each patient
        for (var i = 0; i < pats.length; i++) {
            _loop_2(i);
        }
        var values = { percent: (binCount / totalPats), total: binCount };
        var dataRow = {
            conceptId: concept.id,
            timepointId: bin.label,
            displayValueX: values.total,
            displayValueY: 1,
            displayValues: [ -values.total, values.total ],
            values: values
        };
        output.push(dataRow);
    };
    // For each bin
    for (var bi = 0; bi < bins.length; bi++) {
        _loop_1(bi);
    }
    ;
    // Add index date bin
    var indexDate = {
        conceptId: concept.id, timepointId: 'Index Event',
        displayValueX: 0, displayValueY: 1, displayValues: [0,0],
        values: { percent: 0, total: 0 }
    };
    // Swap null placeholder out with IndexDate
    var placeholder = output.findIndex(function (dr) { return dr === null; });
    output[placeholder] = indexDate;
    return output;
};
/**
 * Get datediff function
 */
var getDateDiffFunc = function (config) {
    var type = config.dateIncrement.incrementType;
    var divider = 1000;
    switch (type) {
        case dateIncrementMinute:
            divider = (1000 * 60);
            break;
        case dateIncrementHour:
            divider = (1000 * 60 * 60);
            break;
        case dateIncrementDay:
            divider = (1000 * 60 * 60 * 24);
            break;
        case dateIncrementWeek:
            divider = (1000 * 60 * 60 * 24 * 7);
            break;
        case dateIncrementMonth:
            divider = (1000 * 60 * 60 * 24 * 30);
            break;
        case dateIncrementYear:
            divider = (1000 * 60 * 60 * 24 * 365);
            break;
    }
    return function (rowDate, initialDate) { return ((rowDate.getTime() - initialDate.getTime()) / divider); };
};
/**
 * Get Timebins
 */
var getTimeBins = function (config) {
    var maxBins = 10;
    var bins = [];
    var incr = config.dateIncrement.increment;
    var startBin;
    var lastBin;
    var lowerBound = 0;
    var upperBound = 0;
    var currIdx = incr;
    // Bail if increment invalid
    if (config.dateIncrement.increment <= 0 || isNaN(config.dateIncrement.increment)) {
        return bins;
    }
    // Before & After
    if (config.dateIncrement.mode === dateDisplayModeBeforeAfter) {
        // Before
        maxBins = 5;
        upperBound = 0;
        lowerBound = -(incr * maxBins);
        currIdx = -incr;
        startBin = { label: ">" + Math.abs(lowerBound), maxNum: lowerBound };
        while (currIdx >= lowerBound) {
            bins.unshift({ label: Math.abs(currIdx + incr) + "-" + Math.abs(currIdx), minNum: currIdx, maxNum: currIdx + incr });
            currIdx -= incr;
        }
        bins.unshift(startBin);
        // Add Index data with null placeholder
        bins.push(null);
        // After
        currIdx = incr;
        lowerBound = 0;
        upperBound = incr * maxBins;
        startBin = { label: "<" + incr, minNum: 0.0001, maxNum: incr };
        lastBin = { label: ">" + upperBound, minNum: upperBound };
        bins.push(startBin);
        while (currIdx < upperBound) {
            bins.push({ label: currIdx + "-" + Math.abs(currIdx + incr), minNum: currIdx, maxNum: currIdx + incr });
            currIdx += incr;
        }
        bins.push(lastBin);
    }
    // After
    else if (config.dateIncrement.mode === dateDisplayModeAfter) {
        lowerBound = 0;
        upperBound = incr * maxBins;
        startBin = { label: "<" + incr, minNum: 0.0001, maxNum: incr };
        lastBin = { label: ">" + upperBound, minNum: upperBound };
        while (currIdx < upperBound) {
            bins.push({ label: currIdx + "-" + Math.abs(currIdx + incr), minNum: currIdx, maxNum: currIdx + incr });
            currIdx += incr;
        }
        bins.unshift(startBin);
        bins.unshift(null);
        bins.push(lastBin);
    }
    // Before
    else if (config.dateIncrement.mode === dateDisplayModeBefore) {
        upperBound = 0;
        lowerBound = -(incr * maxBins);
        currIdx = -incr;
        startBin = { label: ">" + Math.abs(lowerBound), maxNum: lowerBound };
        while (currIdx >= lowerBound) {
            bins.unshift({ label: Math.abs(currIdx + incr) + "-" + Math.abs(currIdx), minNum: currIdx, maxNum: currIdx + incr });
            currIdx -= incr;
        }
        bins.unshift(startBin);
        bins.push(null);
    }
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
    var concept = payload.panel.subPanels[0].panelItems[0].concept;
    conceptDatasetMap.delete(concept.id);
    return { requestId: payload.requestId };
};
/**
 *  Add concept dataset
 */
var addConceptDataset = function (payload) {
    var responderId = payload.responderId;
    var dataset = payload.dataset;
    var panel = payload.panel;
    var concept = payload.panel.subPanels[0].panelItems[0].concept;
    var uniquePatients = Object.keys(dataset.results);
    var store;
    if (!conceptDatasetMap.has(concept.id)) {
        store = {
            panel: panel,
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