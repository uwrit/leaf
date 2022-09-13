/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// eslint-disable-next-line
var handleWorkMessage = function (payload) {
    switch (payload.message) {
        case REINDEX_PATIENTS:
            return reindexCache(payload);
        case SEARCH_PATIENTS:
            return searchPatients(payload);
        default:
            return null;
    }
};
var firstCharCache = new Map();
var allPatients = new Map();
/**
 * Search through available patients
 */
var searchPatients = function (payload) {
    var searchString = payload.searchString, top = payload.top, requestId = payload.requestId;
    var terms = searchString.trim().toLowerCase().split(' ');
    var termCount = terms.length;
    var firstTerm = terms[0];
    var patients = firstCharCache.get(firstTerm[0]);
    var output = [];
    if (!searchString) {
        return { requestId: requestId, result: sort(__spreadArray([], allPatients.values(), true), top) };
    }
    if (!patients) {
        return { requestId: requestId, result: [] };
    }
    // ******************
    // First term
    // ******************
    if (terms.length === 1) {
        for (var _i = 0, patients_1 = patients; _i < patients_1.length; _i++) {
            var p = patients_1[_i];
            var hit = p.tokens.find(function (t) { return t.startsWith(firstTerm); });
            if (hit) {
                output.push(p);
            }
        }
        return { requestId: requestId, result: sort(output, top) };
    }
    // ******************
    // Following terms
    // ******************
    /**
     * For patients found in term one
     */
    for (var _a = 0, patients_2 = patients; _a < patients_2.length; _a++) {
        var p = patients_2[_a];
        var hitCount = 0;
        /**
         * Foreach term after the first (e.g. [ 'jane', 'doe' ])
         * filter what first loop found and remove if no hit
         */
        for (var i = 0; i < termCount; i++) {
            var term = terms[i];
            /**
             * For each other term associated with the patient
             */
            for (var _b = 0, _c = p.tokens; _b < _c.length; _b++) {
                var token = _c[_b];
                if (token.startsWith(term)) {
                    hitCount++;
                    break;
                }
            }
            if (!p.tokens.length)
                break;
        }
        if (hitCount === termCount) {
            output.push(p);
        }
    }
    return { requestId: requestId, result: sort(output, top) };
};
var sort = function (patients, top) {
    var _patients = patients.slice();
    if (top) {
        _patients = _patients.slice(0, top);
    }
    return _patients
        .map(function (p) { return p.patient; })
        .sort(function (a, b) { return a.name > b.name ? 1 : -1; });
};
/**
 * Reset the patient search cache
 */
var reindexCache = function (payload) {
    var patients = payload.patients, requestId = payload.requestId;
    firstCharCache.clear();
    allPatients = new Map();
    /**
     * Foreach patient
     */
    for (var i = 0; i < patients.length; i++) {
        var patient = patients[i];
        var tokens = (patient.name + ' ' + patient.mrn)
            .replace(',', ' ').split(' ')
            .map(function (t) { return t.trim().toLowerCase(); })
            .filter(function (t) { return t.length > 0; });
        var indexed = { patient: patient, tokens: tokens };
        allPatients.set(patient.personId, indexed);
        var added = new Set();
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            var firstChar = token[0];
            if (added.has(firstChar)) {
                continue;
            }
            else {
                added.add(firstChar);
            }
            /**
             * Cache the first first character for quick lookup
             */
            if (!firstCharCache.has(firstChar)) {
                firstCharCache.set(firstChar, [indexed]);
            }
            else {
                firstCharCache.get(firstChar).push(indexed);
            }
        }
    }
    return { requestId: requestId, result: sort(__spreadArray([], allPatients.values(), true)) };
};

`;