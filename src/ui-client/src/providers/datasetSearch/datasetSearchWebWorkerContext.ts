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
            return addDatasetsToCache(payload);
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
var demographicsCat = {
    category: '',
    datasets: new Map([[demographics.id, demographics]])
};
var excluded = new Set([demographics.id]);
var firstCharCache = new Map();
var demographicsAllowed = false;
var allDs = new Map();
/*
 * Sets the special demographics dataset to be included in
 * search results. This is used in the admin panel and ensure
 * that users don't see demographics when navigating the patient list.
 */
var allowDemographics = function (payload) {
    var requestId = payload.requestId, allow = payload.allow;
    if (allow) {
        excluded.delete(demographics.id);
        allDs.set(demographicsCat.category, demographicsCat);
    }
    else {
        excluded.add(demographics.id);
        allDs.delete(demographicsCat.category);
    }
    demographicsAllowed = allow;
    return { requestId: requestId, result: { categories: allDs, datasetCount: getDatasetCount(allDs) } };
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
    return { requestId: requestId, result: { categories: allDs, datasetCount: getDatasetCount(allDs) } };
};
/*
 * Returns the count of datasets present in a categorized dataset array.
 */
var getDatasetCount = function (categories) {
    return [ ...categories.values() ].reduce((sum, cat) => sum + cat.datasets.size, 0);
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
        return { requestId: requestId, result: { categories: allDs, datasetCount: getDatasetCount(allDs) } };
    }
    if (!datasets) {
        return { requestId: requestId, result: { categories: new Map(), datasetCount: 0 } };
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
    var out = new Map();
    var len = refs.length;
    var lastIdx = len - 1;
    var sortedRefs = refs.sort((a,b) => {
        if (a.category === b.category) {
            return a.name > b.name ? 1 : -1;
         }
         return a.category > b.category ? 1 : -1;
    }).map((ref) => Object.assign({}, ref));
    for (var i = 0; i < len; i++) {
        var ref = sortedRefs[i];
        var category = ref.category ? ref.category : '';
        /*
        * Add the dataset.
        */
        if (!addedDatasets.has(ref.id)) {
            var catObj = out.get(category);
            ref.prev = i > 0 ? sortedRefs[i-1] : sortedRefs[lastIdx];
            ref.next = i < lastIdx ? sortedRefs[i+1] : refs[0];
            if (catObj) {
                catObj.datasets.set(ref.id, ref);
            }
            else {
                out.set(category, { category: category, datasets: new Map([[ref.id, ref]]) });
            }
            addedDatasets.add(ref.id);
        }
    }
    return {
        categories: out,
        datasetCount: refs.length
    };
};
/*
 * Sorts categories alphabetically.
 */
var sortCategories = function (input) {
    var sortedCats = new Map([ ...input.entries()].sort());
    sortedCats.forEach((cat) => cat.datasets = new Map([ ...cat.datasets ].sort()));
    return sortedCats;
};
/*
 * Resets the dataset search cache and (re)loads
 * it with inbound datasets.
 */
var addDatasetsToCache = function (payload) {
    var datasets = payload.datasets, requestId = payload.requestId;
    /*
     * Ensure 'Demographics'-shaped datasets are excluded (they shouldn't be here, but just to be safe).
     */
    var all = datasets.slice().filter(function (ds) { return ds.shape !== 3; });
    all.push(demographics);
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
        all.pop();
        excluded.add(demographics.id);
    }
    var sorted = dedupeAndSort(all);
    allDs = sorted.categories;
    return { requestId: requestId, result: sorted };
};
`;