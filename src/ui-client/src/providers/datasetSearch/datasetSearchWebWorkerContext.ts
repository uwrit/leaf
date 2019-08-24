/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
var handleWorkMessage = function (payload) {
    switch (payload.message) {
        case REINDEX_DATASETS:
            return reindexCacheFromExternal(payload);
        case SEARCH_DATASETS:
            return searchDatasets(payload);
        case ALLOW_DATASET_IN_SEARCH:
            return allowDataset(payload);
        case ALLOW_ALL_DATASETS:
            return allowAllDatasets(payload);
        case SET_ADMIN_MODE:
            return setAdminMode(payload);
        default:
            return null;
    }
};
/*
 * Shared cache.
 */
var demographics = { id: 'demographics', shape: 3, category: '', name: 'Basic Demographics', tags: [] };
var firstCharCache = new Map();
var excluded = new Map([[demographics.id, demographics]]);
var allDs = new Map();
/*
 * Admin-facing cache.
 */
var isAdmin = false;
var allCatDsAdmin = new Map();
var defaultOrderAdmin = new Map();
/*
 * User-facing cache.
 */
var allCatDs = new Map();
var defaultOrder = new Map();
/*
 * Set whether the worker should return search results to an admin (i.e., no exclusions),
 * or to a user.
 */
var setAdminMode = function (payload) {
    var requestId = payload.requestId, admin = payload.admin;
    isAdmin = admin;
    return { requestId: requestId, result: returnDefault() };
};
/*
 * Return the default display depending on whether the current mode is admin or user.
 */
var returnDefault = function () {
    if (isAdmin) {
        return { categories: allCatDsAdmin, displayOrder: defaultOrderAdmin };
    }
    return { categories: allCatDs, displayOrder: defaultOrder };
};
/*
 * Flatten categorized datasets map into an array of datasets.
 */
var getAllDatasetsArray = function () {
    var copy = new Map(allDs);
    if (!isAdmin) {
        copy.delete(demographics.id);
    }
    return [ ...copy.values() ];
};
/*
 * Reset excluded datasets cache. Called when users
 * reset the cohort and the patient list too is reset.
 */
var allowAllDatasets = function (payload) {
    var requestId = payload.requestId;
    excluded.clear();
    excluded.set(demographics.id, demographics);
    /*
     * Get default display and sort order.
     */
    var reSorted = dedupeAndSort(getAllDatasetsArray());
    allCatDs = reSorted.categories;
    defaultOrder = reSorted.displayOrder;
    return { requestId: requestId, result: returnDefault() };
};
/*
 * Allow or disallow a dataset to be included in search results.
 * Called as users add/remove datasets from the patient list screen.
 */
var allowDataset = function (payload) {
    var datasetId = payload.datasetId, allow = payload.allow;
    if (allow) {
        excluded.delete(datasetId);
    }
    else {
        var ds = allDs.get(datasetId);
        if (ds) {
            excluded.set(ds.id, ds);
        }
    }
    var datasets = getAllDatasetsArray().filter((ds) => !excluded.has(ds.id));
    var reSorted = dedupeAndSort(datasets);
    allCatDs = reSorted.categories;
    defaultOrder = reSorted.displayOrder;
    return searchDatasets(payload);
};
/*
 * Search through available datasets.
 */
var searchDatasets = function (payload) {
    var searchString = payload.searchString, requestId = payload.requestId;
    var terms = searchString.trim().split(' ');
    var termCount = terms.length;
    var firstTerm = terms[0];
    var datasets = firstCharCache.get(firstTerm[0]);
    var dsOut = [];
    if (!searchString) {
        return { requestId: requestId, result: returnDefault() };
    }
    if (!datasets) {
        return { requestId: requestId, result: { categories: new Map(), displayOrder: new Map() } };
    }
    // ******************
    // First term
    // ******************
    /*
     * Foreach dataset compare with search term one. If demographics
     * are disabled this is for a user, so leave out excluded datasets.
     */
    if (!isAdmin) {
        for (var i1 = 0; i1 < datasets.length; i1++) {
            var ds = datasets[i1];
            if (!excluded.has(ds.id) && ds.token.startsWith(firstTerm)) {
                dsOut.push(ds);
            }
        }
        /*
         * Else this is for an admin in the admin panel, so there are no exclusions.
         */
    }
    else {
        for (var i1 = 0; i1 < datasets.length; i1++) {
            var ds = datasets[i1];
            if (ds.token.startsWith(firstTerm)) {
                dsOut.push(ds);
            }
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
 * Extract datasets from tokenized refs and returns
 * a sorted, deduped result array.
 */
var dedupeAndSortTokenized = function (refs) {
    var ds = refs.map(function (r) { return r.dataset; });
    return dedupeAndSort(ds);
};
/*
 * Remove duplicates, sort alphabetically, and
 * return a displayable categorized array of datasets.
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
var reindexCacheFromExternal = function (payload) {
    var requestId = payload.requestId, datasets = payload.datasets;
    var sorted = reindexCacheCache(datasets);
    return { requestId: requestId, result: sorted };
};
/*
 * Reset the dataset search cache and (re)load
 * it with inbound datasets.
 */
var reindexCacheCache = function (datasets) {
    /*
     * Ensure 'Demographics'-shaped datasets are excluded (they shouldn't be here, but just to be safe).
     */
    var all = datasets.slice().filter(function (ds) { return ds.shape !== 3; });
    all.unshift(demographics);
    allDs.clear();
    allCatDs.clear();
    allCatDsAdmin.clear();
    allCatDsAdmin.set('', { category: '', datasets: new Map([[demographics.id, demographics]]) });
    firstCharCache.clear();
    excluded.clear();
    excluded.set(demographics.id, demographics);
    /*
     * Foreach dataset
     */
    for (var i = 0; i < all.length; i++) {
        var ds = all[i];
        var tokens = ds.name.toLowerCase().split(' ').concat(ds.tags.map(t => t.toLowerCase()));
        if (ds.category) {
            tokens = tokens.concat(ds.category.toLowerCase().split(' '));
        }
        if (ds.description) {
            tokens = tokens.concat(ds.description.toLowerCase().split(' '));
        }
        allDs.set(ds.id, ds);
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
             * Cache the first first character for quick lookup.
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
    /*
     * Set admin search default display.
     */
    var adminSorted = dedupeAndSort(all);
    allCatDsAdmin = adminSorted.categories;
    defaultOrderAdmin = adminSorted.displayOrder;
    /*
     * Set user search default display.
     */
    all.shift();
    var userSorted = dedupeAndSort(all);
    allCatDs = userSorted.categories;
    defaultOrder = userSorted.displayOrder;
    return userSorted;
};
`;