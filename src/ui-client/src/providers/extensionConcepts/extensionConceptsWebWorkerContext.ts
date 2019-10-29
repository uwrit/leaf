/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
// eslint-disable-next-line
var handleWorkMessage = function (payload) {
    switch (payload.message) {
        case BUILD_EXTENSION_TREE:
            return buildExtensionImportTree(payload);
        case SEARCH_SAVED_COHORTS:
            return search(payload);
        case LOAD_EXTENSION_CONCEPT_CHILDREN:
            return loadExtensionChildrenConcepts(payload);
        case GET_EXTENSION_CONCEPT:
            return getExtensionConcept(payload);
        default:
            return null;
    }
};
var conceptMap = new Map();
var loadExtensionChildrenConcepts = function (payload) {
    const { requestId, concept } = payload;
    const children = [ ... conceptMap.values() ].filter(c => c.parentId === concept.id)
    return { requestId, result: children };
};
var getExtensionConcept = function (payload) {
    const { requestId, id } = payload;
    const concept = conceptMap.get(id);
    return { requestId: requestId, result: concept };
};
/*
 * Build the extension concept tree map.
 */
var buildExtensionImportTree = function (payload) {
    var requestId = payload.requestId, imports = payload.imports, savedQueries = payload.savedQueries;
    var redcap = imports.filter(function (i) { return i.type === redcapImport; });
    conceptMap = new Map();
    buildRedcapImportTree(redcap);
    buildSavedCohortTree(savedQueries);
    const roots = [ ...conceptMap.values() ].filter(c => c.id.endsWith('root'));
    return { requestId: requestId, result: roots };
};
/*
 * Build the REDCap Import-specific concept tree map.
 */
var buildRedcapImportTree = function (redcapImports) {
    var rootId = 'urn:leaf:import:redcap:root';
    var root = __assign(__assign({}, getEmptyConcept()), { id: "urn:leaf:import:redcap:root", isParent: true, childrenLoaded: false, id: rootId, universalId: rootId, injectChildrenOnDrop: [], uiDisplayName: 'REDCap Imports', extensionType: redcapImportType });
    for (var i = 0; i < redcapImports.length; i++) {
        var impt = redcapImports[i];
        var struct = impt.structure;
        // Set Concepts
        for (var j = 0; j < struct.concepts.length; j++) {
            var conc = struct.concepts[j];
            conc.childrenIds = undefined;
            conc.childrenLoaded = false;
            conc.extensionType = redcapImportType;
            conc.extensionId = impt.id;
            conceptMap.set(conc.id, conc);
        }
    }
    conceptMap.set(root.id, root);
};
/*
 * Build a Map object to be unioned with the Concept tree
 * to search for and display saved cohorts in patient list.
 */
var buildSavedCohortTree = function (savedQueries) {
    var all = [];
    var catIds = new Set();
    var prefix = 'urn:leaf:query';
    var rootId = prefix + ":root";
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
            const catConcept = conceptMap.get(catId);
            catConcept.injectChildrenOnDrop.push(concept);
        } else {
            const newCatConcept = categoryToConcept(catId, query, rootId);
            conceptMap.set(catId, newCatConcept);
        }
    }
    // Add root concept
    var root = getRootConcept(all, catIds, rootId);
    conceptMap.set(rootId, root);
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
    concept.uiDisplayPatientCount = query.count ? query.count : undefined;
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
    concept.childrenLoaded = false;
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
    concept.childrenLoaded = false;
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