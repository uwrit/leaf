/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
var handleWorkMessage = function (payload) {
    switch (payload.message) {
        case BUILD_SAVED_COHORT_TREE:
            return buildSavedCohortTree(payload);
        case SEARCH_SAVED_COHORTS:
            return search(payload);
        default:
            return null;
    }
};
var conceptMap = new Map();
/*
 * Build a Map object to be unioned with the Concept tree
 * to search for and display saved cohorts in patient list.
 */
var buildSavedCohortTree = function (payload) {
    var requestId = payload.requestId;
    var savedQueries = payload.savedQueries;
    var all = [];
    var catIds = new Set();
    var prefix = 'urn:leaf:query';
    var rootId = prefix + ":root";
    conceptMap = new Map();
    // For each saved query
    for (var i = 0; i < savedQueries.length; i++) {
        var query = savedQueries[i];
        var catId = prefix + ":category:" + query.category.toLowerCase();
        var concept = cohortToConcept(catId, query, rootId);
        // Add query concept
        conceptMap.set(concept.universalId, concept);
        catIds.add(catId);
        all.push(concept);
        // Add category as concept
        if (conceptMap.has(catId)) {
            var catConcept = conceptMap.get(catId);
            if (!catConcept.childrenIds.has(concept.universalId)) {
                catConcept.injectChildrenOnDrop.push(concept);
                catConcept.childrenIds.add(concept.universalId);
            }
        }
        else {
            var newCatConcept = categoryToConcept(catId, query, rootId);
            conceptMap.set(catId, newCatConcept);
        }
    }
    // Add root concept
    var root = getRootConcept(all, catIds, rootId);
    conceptMap.set(rootId, root);
    return { result: { concepts: conceptMap, roots: [rootId] }, requestId: requestId };
};
var getEmptyConcept = function () {
    return {
        extensionId: '',
        id: '',
        isExtension: true,
        isEncounterBased: false,
        isEventBased: false,
        isNumeric: false,
        isPatientCountAutoCalculated: false,
        isParent: false,
        isSpecializable: false,
        rootId: '',
        uiDisplayName: '',
        uiDisplayText: '',
        universalId: '',
        childrenLoaded: false,
        isFetching: false,
        isOpen: false,
    };
};
/*
 * Returns a Concept to be displayed in UI for a given Saved Cohort.
 */
var cohortToConcept = function (categoryId, query, rootId) {
    var concept = getEmptyConcept();
    concept.extensionType = savedQueryType;
    concept.extensionId = query.id;
    concept.id = query.universalId;
    concept.universalId = query.universalId;
    concept.parentId = categoryId;
    concept.rootId = rootId;
    concept.uiDisplayName = query.name;
    concept.uiDisplayText = 'Included in cohort "' + query.name + '"';
    concept.uiDisplayPatientCount = query.count;
    return concept;
};
/*
 * Returns a Concept to be displayed in UI for a given Saved Cohort.
 */
var categoryToConcept = function (categoryId, query, rootId) {
    var childrenOnDrop = conceptMap.get(query.universalId);
    var concept = getEmptyConcept();
    concept.extensionType = savedQueryType;
    concept.injectChildrenOnDrop = [childrenOnDrop];
    concept.isParent = true;
    concept.parentId = rootId;
    concept.rootId = rootId;
    concept.childrenLoaded = true;
    concept.childrenIds = new Set([childrenOnDrop.universalId]);
    concept.id = categoryId;
    concept.universalId = categoryId;
    concept.uiDisplayName = query.category;
    return concept;
};
/*
 * Returns a default concept used for roots.
 */
var getRootConcept = function (children, directChildrenIds, rootId) {
    var concept = getEmptyConcept();
    concept.extensionType = savedQueryType;
    concept.isParent = true;
    concept.childrenLoaded = true;
    concept.childrenIds = directChildrenIds;
    concept.id = rootId;
    concept.universalId = rootId;
    concept.rootId = rootId;
    concept.uiDisplayName = 'My Saved Cohorts';
    concept.injectChildrenOnDrop = children;
    return concept;
};
var search = function (payload) {
    var requestId = payload.requestId;
    return { requestId: requestId };
};
`