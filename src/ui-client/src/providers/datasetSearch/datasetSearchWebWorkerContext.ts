/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
var handleWorkMessage = function (payload) {
    switch (payload.message) {
        case ADD_DATASETS:
            return addDatasetsToCache(payload);
        case SEARCH_DATASETS:
            return searchDatasets(payload);
        case ALLOW_DATASET_IN_SEARCH:
            return allowDatasetInSearch(payload);
        case ALLOW_ALL_DATASETS:
            return allowAllDatasets(payload);
        default:
            return null;
    }
};
// Dataset cache
var datasetCache = new Map();
var excluded = new Set();
var allDatasets = [];
var allowedDatasets = [];
// Map of first char of full terms
var firstCharCache = new Map();
var allowAllDatasets = function (payload) {
    var requestId = payload.requestId;
    excluded.clear();
    allowedDatasets = allDatasets.slice();
    return { requestId: requestId, result: allDatasets };
};
var allowDatasetInSearch = function (payload) {
    var requestId = payload.requestId, datasetId = payload.datasetId, include = payload.include;
    if (include) {
        excluded.delete(datasetId);
    }
    else {
        excluded.add(datasetId);
    }
    updateAllowedDatasets();
    return { requestId: requestId };
};
var updateAllowedDatasets = function () {
    allowedDatasets = [];
    for (var i = 0; i < allDatasets.length; i++) {
        var datasets = [];
        var cat = allDatasets[i];
        for (var j = 0; j < cat.datasets.length; j++) {
            var ds = cat.datasets[j];
            if (!excluded.has(ds.id)) {
                datasets.push(ds);
            }
        }
        if (datasets.length) {
            allowedDatasets.push({
                category: cat.category,
                datasets: datasets
            });
        }
    }
};
var searchDatasets = function (payload) {
    var searchString = payload.searchString, requestId = payload.requestId;
    var terms = searchString.trim().split(' ');
    var termCount = terms.length;
    var firstTerm = terms[0];
    var allDs = firstCharCache.get(firstTerm[0]);
    var dsOut = [];
    if (!searchString) {
        return { requestId: requestId, result: allowedDatasets };
    }
    if (!allDs) {
        return { requestId: requestId, result: [] };
    }
    // ******************
    // First term
    // ******************
    // Foreach dataset compare with search term one
    for (var i1 = 0; i1 < allDs.length; i1++) {
        var ds = allDs[i1];
        if (!excluded.has(ds.id) && ds.token.startsWith(firstTerm)) {
            dsOut.push(ds);
        }
    }
    if (terms.length === 1) {
        return { requestId: requestId, result: dedupeAndSortTokenized(dsOut) };
    }
    // ******************
    // Following terms
    // ******************
    // For datasets found in loop one
    var dsFinal = [];
    for (var dsIdx = 0; dsIdx < dsOut.length; dsIdx++) {
        var otherTokens = dsOut[dsIdx].tokenArray.slice();
        var hitCount = 1;
        // Foreach term after the first (e.g. [ 'white', 'blood' ])
        // filter what first loop found and remove if no hit
        for (var i2 = 1; i2 < termCount; i2++) {
            var term = terms[i2];
            // For each other term associated with the dataset name
            for (var j = 0; j < otherTokens.length; j++) {
                if (otherTokens[j].startsWith(term)) {
                    hitCount++;
                    otherTokens.splice(j, 1);
                    break;
                }
            }
            if (!otherTokens.length)
                break;
        }
        if (hitCount === termCount) {
            dsFinal.push(dsOut[dsIdx]);
        }
    }
    return { requestId: requestId, result: dedupeAndSortTokenized(dsFinal) };
};
var dedupeAndSortTokenized = function (refs) {
    var ds = refs.map(function (r) { return r.dataset; });
    return dedupeAndSort(ds);
};
var dedupeAndSort = function (refs) {
    var added = new Set();
    var catIdxMap = new Map();
    var out = [];
    for (var i = 0; i < refs.length; i++) {
        var ref = refs[i];
        var cat = ref.category ? ref.category : '';
        /*
         * Add the dataset.
         */
        if (!added.has(ref.id)) {
            /*
             * Add the category.
             */
            var catIdx = catIdxMap.get(cat);
            if (catIdx !== undefined) {
                out[catIdx].datasets.push(ref);
            }
            else {
                catIdxMap.set(cat, out.length);
                out.push({
                    category: cat,
                    datasets: [ref]
                });
            }
            added.add(ref.id);
        }
    }
    return out.sort(categorySorter);
};
var categorySorter = function (a, b) {
    a.datasets.sort(datasetSorter);
    b.datasets.sort(datasetSorter);
    return a.category.localeCompare(b.category);
};
var datasetSorter = function (a, b) {
    return a.name.localeCompare(b.name);
};
var addDatasetsToCache = function (payload) {
    var datasets = payload.datasets, requestId = payload.requestId;
    var allDs = [];
    // Foreach dataset
    for (var i = 0; i < datasets.length; i++) {
        var ds = datasets[i];
        if (ds.shape === 3) { continue; } // Ensure Demographics-shape datasets are excluded.
        
        var tokens = ds.name.toLowerCase().split(' ');
        if (ds.category) {
            tokens = tokens.concat(ds.category.toLowerCase().split(' '));
        }
        if (ds.description) {
            tokens = tokens.concat(ds.description.toLowerCase().split(' '));
        }

        var _loop_1 = function (j) {
            var token = tokens[j];
            var ref = {
                id: ds.id,
                dataset: ds,
                token: token,
                tokenArray: tokens.filter(function (t) { return t !== token; })
            };
            var firstChar = token[0];
            // Cache the first first character for quick lookup
            if (!firstCharCache.has(firstChar)) {
                firstCharCache.set(firstChar, [ref]);
            }
            else {
                firstCharCache.get(firstChar).push(ref);
            }
        };
        for (var j = 0; j <= tokens.length - 1; j++) {
            _loop_1(j);
        }
        datasetCache.set(ds.id, ds);
        allDs.push(ds);
    }
    allDatasets = dedupeAndSort(allDs);
    updateAllowedDatasets();
    return { requestId: requestId, result: allDatasets };
};
`;