/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
var handleWorkMessage = function (payload) {
    switch (payload.message) {
        case ADD_CONCEPT_HINTS:
            return addToCache(payload);
        case ADD_CONCEPT_HINTS_AND_SEARCH:
            return addHintsAndSearch(payload);
        case SEARCH_CONCEPT_HINTS:
            return search(payload);
        case INITIALIZE_SEARCH_ENGINE:
            return initialize(payload);
        default:
            return null;
    }
};
var cache = new Map();
var maxHintsToReturn = 0;
var addHintsAndSearch = function (payload) {
    addToCache(payload);
    return search(payload);
};
var groupSearchResults = function (results) {
    var agg = new Map();
    var fullText = new Set();
    var thresholdMet = false;
    var _loop_1 = function (i) {
        var match = results[i];
        /*
         * Add to matched rows to be returned
         * if this ref has same matched tokens.
         */
        agg.forEach(function (val) {
            if (match.matchedTerms === val.text && match.remainingTerms.has(val.suggestion)) {
                val.ids.push(match.ref.id);
            }
        });
        /*
         * Try to add suggestions if still under threshold.
         */
        var suggestions = Array.from(match.remainingTerms);
        for (var j = 0; j < suggestions.length && !thresholdMet; j++) {
            var suggestion = suggestions[j];
            var rowIdx = match.matchedTerms + suggestion;
            if (!fullText.has(rowIdx)) {
                var row = {
                    ids: [match.ref.id],
                    fullText: match.matchedTerms + ' ' + suggestion,
                    text: match.matchedTerms,
                    suggestion: suggestion
                };
                agg.set(rowIdx, row);
                fullText.add(rowIdx);
                if (agg.size === maxHintsToReturn) {
                    thresholdMet = true;
                }
            }
        }
    };
    /*
     * First find 5 rows' worth of matches
     * and additional suggested tokens.
     */
    for (var i = 0; i < results.length; i++) {
        _loop_1(i);
    }
    var out = [];
    agg.forEach(function (val) { return out.push(val); });
    return out;
};
var search = function (payload) {
    var searchString = payload.searchString, requestId = payload.requestId, rootId = payload.rootId;
    var terms = searchString.trim().split(' ');
    var termCount = terms.length;
    var firstTerm = terms[0];
    var scopeTokens = cache.get(rootId).get(firstTerm[0]);
    var hits = [];
    var groups = [];
    if (!searchString || !scopeTokens) {
        return { requestId: requestId, result: [] };
    }
    // ******************
    // First term
    // ******************
    // Foreach ref group compare with search term one
    for (var i1 = 0; i1 < scopeTokens.length; i1++) {
        var grp = scopeTokens[i1];
        if (grp.text.startsWith(firstTerm)) {
            groups.push(grp);
            for (var i2 = 0; i2 < grp.refs.length; i2++) {
                var ref = grp.refs[i2];
                hits.push({ matchedTerms: grp.text, remainingTerms: new Set(ref.tokens), ref: ref });
            }
        }
    }
    if (terms.length === 1) {
        return { requestId: requestId, result: groupSearchResults(hits) };
    }
    // ******************
    // Following terms
    // ******************
    // For datasets found in loop one
    var final = [];
    for (var g1 = 0; g1 < groups.length; g1++) {
        var grp = groups[g1];
        for (var r1 = 0; r1 < grp.refs.length; r1++) {
            var ref = grp.refs[r1];
            var tokens = ref.tokens.slice();
            var matched = [grp.text];
            var hitCount = 1;
            // Foreach term after the first (e.g. [ 'white', 'blood' ])
            // filter what first loop found and remove if no hit
            for (var r2 = 1; r2 < termCount; r2++) {
                var term = terms[r2];
                // For each other token in Concept name
                for (var j = 0; j < tokens.length; j++) {
                    if (tokens[j].startsWith(term)) {
                        hitCount++;
                        matched.push(tokens[j]);
                        tokens.splice(j, 1);
                        break;
                    }
                }
            }
            if (hitCount === termCount) {
                final.push({ matchedTerms: matched.join(' '), ref: ref, remainingTerms: new Set(tokens) });
            }
        }
    }
    return { requestId: requestId, result: groupSearchResults(final) };
};
var initialize = function (payload) {
    var displayThreshhold = payload.displayThreshhold, requestId = payload.requestId, roots = payload.roots;
    maxHintsToReturn = displayThreshhold;
    for (var i = 0; i < roots.length; i++) {
        var root = roots[i];
        cache.set(root, new Map());
    }
    return { requestId: requestId };
};
var addToCache = function (payload) {
    var hints = payload.hints, rootId = payload.rootId, requestId = payload.requestId;
    var _loop_2 = function (i) {
        var h = hints[i];
        var _loop_3 = function (j) {
            var token = h.tokens[j];
            var first = token[0];
            var ref = {
                id: h.conceptId,
                text: token,
                tokens: h.tokens.slice().filter(function (t, i) { return i !== j; })
            };
            // Root
            var cacheRoot = cache.get(rootId);
            // Groups by first char
            var groups = cacheRoot.get(first);
            if (groups) {
                // Find refs matching this text
                var group = groups.find(function (g) { return g.text === token; });
                if (group) {
                    if (!group.refs.find(function (r) { return r.id === h.conceptId; })) {
                        group.refs.push(ref);
                    }
                }
                else {
                    groups.push({ text: token, refs: [ref] });
                }
            }
            else {
                cacheRoot.set(first, [
                    { text: token, refs: [ref] }
                ]);
            }
        };
        for (var j = 0; j <= h.tokens.length - 1; j++) {
            _loop_3(j);
        }
    };
    // Foreach hint
    for (var i = 0; i < hints.length; i++) {
        _loop_2(i);
    }
    return { requestId: requestId, result: [] };
};
`
