/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
var handleWorkMessage = function (payload) {
    switch (payload.message) {
        case INDEX_DATASETS:
            return reindexCacheFromExternal(payload);
        case SEARCH_DATASETS:
            return searchDatasets(payload);
        case ALLOW_DATASET_IN_SEARCH:
            return allowDatasetInSearch(payload);
        case ALLOW_ALL_DATASETS:
            return allowAllDatasets(payload);
        case ALLOW_DEMOGRAPHICS:
            return allowDemographics(payload);
        default:
            return null;
    }
};
// Dataset cache
var demographics = { id: 'demographics', shape: 3, category: '', name: 'Basic Demographics', tags: [] };
var excluded = new Set([demographics.id]);
var firstCharCache = new Map();
var demographicsAllowed = false;
var allDs = [];
var allDsMap = new Map();
var defaultOrder = new Map();
/*
 * Sets the special demographics dataset to be included in
 * search results. This is used in the admin panel and ensure
 * that users don't see demographics when navigating the patient list.
 */
var allowDemographics = function (payload) {
    var requestId = payload.requestId, allow = payload.allow;
    if (allow) {
        excluded.delete(demographics.id);
    }
    else {
        excluded.add(demographics.id);
    }
    demographicsAllowed = allow;
    reindexCacheFromLocal(payload);
    return { requestId: requestId, result: { categories: allDsMap, displayOrder: defaultOrder } };
};
/*
 * Resets excluded datasets cache. Called when users
 * reset the cohort and the patient list too is reset.
 */
var allowAllDatasets = function (payload) {
    var requestId = payload.requestId;
    excluded.clear();
    if (!demographicsAllowed) {
        excluded.add(demographics.id);
    }
    return { requestId: requestId, result: { categories: allDsMap, displayOrder: defaultOrder } };
};
/*
 * Allows or disallows a dataset to be included in search results.
 * Called as users add/remove datasets from the patient list screen.
 */
var allowDatasetInSearch = function (payload) {
    var requestId = payload.requestId, datasetId = payload.datasetId, allow = payload.allow;
    if (allow) {
        excluded.delete(datasetId);
    }
    else {
        excluded.add(datasetId);
    }
    return { requestId: requestId };
};
/*
 * Searches through available datasets.
 */
var searchDatasets = function (payload) {
    var searchString = payload.searchString, requestId = payload.requestId;
    var terms = searchString.trim().split(' ');
    var termCount = terms.length;
    var firstTerm = terms[0];
    var datasets = firstCharCache.get(firstTerm[0]);
    var dsOut = [];
    if (!searchString) {
        return { requestId: requestId, result: { categories: allDsMap, displayOrder: defaultOrder } };
    }
    if (!datasets) {
        return { requestId: requestId, result: { categories: new Map(), displayOrder: new Map() } };
    }
    // ******************
    // First term
    // ******************
    /*
     * Foreach dataset compare with search term one
     */
    for (var i1 = 0; i1 < datasets.length; i1++) {
        var ds = datasets[i1];
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
    /*
     * For datasets found in loop one
     */
    var dsFinal = [];
    for (var dsIdx = 0; dsIdx < dsOut.length; dsIdx++) {
        var otherTokens = dsOut[dsIdx].tokenArray.slice();
        var hitCount = 1;
        /*
         * Foreach term after the first (e.g. [ 'white', 'blood' ])
         * filter what first loop found and remove if no hit
         */
        for (var i2 = 1; i2 < termCount; i2++) {
            var term = terms[i2];
            /*
             * For each other term associated with the dataset name
             */
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
/*
 * Extracts datasets from tokenized refs and returns
 * a sorted, deduped result array.
 */
var dedupeAndSortTokenized = function (refs) {
    var ds = refs.map(function (r) { return r.dataset; });
    return dedupeAndSort(ds);
};
/*
 * Removes duplicates, sorts alphabetically, and
 * returns a displayable categorized array of datasets.
 */
var dedupeAndSort = function (refs) {
    var addedDatasets = new Set();
    var addedRefs = [];
    var out = new Map();
    var displayOrder = new Map();
    var includesDemographics = false;
    /*
     * Get unique only.
     */
    for (var i = 0; i < refs.length; i++) {
        var ref = refs[i];
        if (!addedDatasets.has(ref.id)) {
            if (ref.shape === 3) {
                includesDemographics = true;
            }
            else {
                if (!ref.category) {
                    ref.category = '';
                }
                addedRefs.push(ref);
                addedDatasets.add(ref.id);
            }
        }
    }
    /*
     * Sort.
     */
    var sortedRefs = addedRefs.sort(function (a, b) {
        if (a.category === b.category) {
            return a.name > b.name ? 1 : -1;
        }
        return a.category > b.category ? 1 : -1;
    });
    if (includesDemographics) {
        sortedRefs.unshift(demographics);
    }
    var len = sortedRefs.length;
    var lastIdx = len - 1;
    /*
     * Add to map.
     */
    for (var i = 0; i < len; i++) {
        var ref = sortedRefs[i];
        var catObj = out.get(ref.category);
        var order = {
            prevId: i > 0 ? sortedRefs[i - 1].id : sortedRefs[lastIdx].id,
            nextId: i < lastIdx ? sortedRefs[i + 1].id : sortedRefs[0].id
        };
        displayOrder.set(ref.id, order);
        if (catObj) {
            catObj.datasets.set(ref.id, ref);
        }
        else {
            out.set(ref.category, { category: ref.category, datasets: new Map([[ref.id, ref]]) });
        }
    }
    return { categories: out, displayOrder: displayOrder };
};
var reindexCacheFromLocal = function (payload) {
    var requestId = payload.requestId;
    var sorted = addDatasetsToCache(allDs);
    return { requestId: requestId, result: sorted };
};
var reindexCacheFromExternal = function (payload) {
    var requestId = payload.requestId, datasets = payload.datasets;
    var sorted = addDatasetsToCache(datasets);
    return { requestId: requestId, result: sorted };
};
/*
 * Resets the dataset search cache and (re)loads
 * it with inbound datasets.
 */
var addDatasetsToCache = function (datasets) {
    /*
     * Ensure 'Demographics'-shaped datasets are excluded (they shouldn't be here, but just to be safe).
     */
    var all = datasets.slice().filter(function (ds) { return ds.shape !== 3; });
    all.unshift(demographics);
    allDsMap.clear();
    allDsMap.set('', { category: '', datasets: new Map([[demographics.id, demographics]]) });
    firstCharCache.clear();
    /*
     * Foreach dataset
     */
    for (var i = 0; i < all.length; i++) {
        var ds = all[i];
        var tokens = ds.name
            .toLowerCase()
            .split(' ')
            .concat(ds.tags);
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
            /*
             * Cache the first first character for quick lookup
             */
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
    }
    if (!demographicsAllowed) {
        all.shift();
        excluded.add(demographics.id);
    }
    var sorted = dedupeAndSort(all);
    allDs = datasets;
    allDsMap = sorted.categories;
    defaultOrder = sorted.displayOrder;
    return sorted;
};
`;