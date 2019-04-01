/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import {
    ERROR_CONCEPTS,
    RECEIVE_CONCEPT_CHILDREN,
    REQUEST_CONCEPT_CHILDREN,
    REQUEST_SEARCH_TREE,
    SET_CONCEPT,
    SET_CONCEPTS,
    SET_ROOT_CONCEPTS,
    SET_SEARCH_TREE,
    SET_EXTENSION_CONCEPTS,
    SET_EXTENSION_CONCEPT,
    SET_SELECTED_CONCEPT,
    REPARENT_CONCEPT,
    MERGE_EXTENSION_CONCEPTS,
    REMOVE_EXTENSION_CONCEPT,
    SHOW_DRILL_TREE,
    TOGGLE_CONCEPT_OPEN,
    REMOVE_CONCEPT,
    CREATE_CONCEPT
} from '../actions/concepts';
import { ConceptsAction } from '../actions/concepts';
import { ConceptMap, ConceptsState } from '../models/state/AppState';
import { Concept, ExtensionConcept } from '../models/concept/Concept';

export const defaultConceptsState = (): ConceptsState => {
    return {
        allowRerender: new Set<string>(),
        currentTree: new Map<string, Concept>(),
        drillTree: new Map<string, Concept>(),
        extensionTree: new Map<string, Concept>(),
        requestingSearchTree: false,
        roots: [],
        searchTree: new Map<string, Concept>(),
        selectedId: '',
        showSearchTree: false
    };
};

const getAncestors = (concept: Concept, cache: ConceptMap): Set<string> => {
    const updateChain = new Set([concept.id]);
    let parentId = cache.get(concept.id)!.parentId;
    
    while (parentId) {
        updateChain.add(parentId);
        parentId = cache.get(parentId)!.parentId;
    }
    return updateChain;
};

const toggleConceptOpen = (state: ConceptsState, concept: Concept): ConceptsState => {
    const newConcept = Object.assign({}, concept, { isOpen: !concept.isOpen });
    const updated: Concept[] = [ newConcept ];

    // Make sure all children of newly opened concept are closed to
    // prevent odd rendering issues (if they were previously opened but
    // a grandparent concept was closed, we automatically unrendered them,
    // so make sure they are closed to avoid confusing the user)
    if (newConcept.isOpen && newConcept.childrenLoaded) {
        for (const childId of newConcept.childrenIds!) {
            const childConcept = state.currentTree.get(childId);
            if (childConcept && childConcept.isOpen) {
                const clone =  Object.assign({}, childConcept, { isOpen: false });
                updated.push(clone);
            }
        }
    }
    return Object.assign({}, addConcepts(state, updated), {
        allowRerender: getAncestors(concept, state.currentTree),
        selectedId: concept.id
    })
};

const requestSearchTree = (state: ConceptsState): ConceptsState => {
    return Object.assign({}, state, {
        requestingSearchTree: true
    })
};

const receiveSearchTree = (state: ConceptsState, cons: Concept[]): ConceptsState => {
    const searchTree = new Map<string, Concept>();
    const allowRerender = new Set<string>();

    // Set client-only tree-related fields
    cons.forEach(c => {
        c = { ...c, childrenIds: new Set<string>(), childrenLoaded: false, isFetching: false, isOpen: false }
        searchTree.set(c.id, c)
    });

    // Create parent-child hierarchy and default all 
    // parents to open if they have children loaded
    cons.forEach(c => {
        allowRerender.add(c.id);
        if (c.parentId) {
            const parent = searchTree.get(c.parentId);
            if (parent) {
                parent.childrenIds!.add(c.id);
                searchTree.set(parent.id, { ...parent, childrenLoaded: true, isOpen: true })
            }
        }
    });

    return Object.assign({}, state, {
        allowRerender,
        currentTree: searchTree,
        drillTree: state.showSearchTree ? state.drillTree : state.currentTree,
        requestingSearchTree: false,
        searchTree,
        showSearchTree: true
    });
};

const requestConceptChildren = (state: ConceptsState, concept: Concept): ConceptsState => {
    const newConcept = Object.assign({}, concept, {
        childrenLoaded: false,
        isFetching: true,
        isOpen: false
    });
    return Object.assign({}, addConcepts(state, [newConcept]), {
        allowRerender: getAncestors(newConcept, state.currentTree)
    });
};

const receiveConceptChildren = (state: ConceptsState, concept: Concept, children: Concept[]): ConceptsState => {
    const childrenIds = concept.childrenIds 
        ? new Set<string>([ ...concept.childrenIds, ...children.map(c => c.id)])
        : new Set<string>(children.map(c => c.id))

    const newConcept = Object.assign({}, concept, {
        childrenIds,
        childrenLoaded: true,
        isFetching: false,
        isOpen: true
    });
    const newState = addConcepts(state, [...children, newConcept]);

    return Object.assign({}, newState, {
        allowRerender: getAncestors(newConcept, state.currentTree)
    });
};

const showDrillTree = (state: ConceptsState) => {
    const combined = new Map([...state.drillTree, ...state.extensionTree]);
    const renderedDrillTreeConcepts: Set<string> = new Set();
    combined.forEach((c: Concept) => renderedDrillTreeConcepts.add(c.id));

    return Object.assign({}, state, {
        allowRerender: renderedDrillTreeConcepts,
        currentTree: combined,
        requestingSearchTree: false,
        showSearchTree: false
    });
};

const addRootConcepts = (state: ConceptsState, roots: Concept[]): ConceptsState => {
    const currentTree = new Map();
    roots.forEach(c => currentTree.set(c.id, c));
    return Object.assign({}, state, {
        currentTree,
        drillTree: currentTree,
        roots: roots!.map(c => c.id)
    });
};

const addConcepts = (state: ConceptsState, cons: Concept[]): ConceptsState => {
    const currentTree = new Map(state.currentTree);
    cons.forEach(c => currentTree.set(c.id, c));
    return Object.assign({}, state, { currentTree });
};


const setExtensionConcepts = (state: ConceptsState, extensionTree: ConceptMap, roots: string[]): ConceptsState => {
    return Object.assign({}, state, {
        currentTree: new Map([...state.currentTree, ...extensionTree]),
        roots: state.roots.slice().concat(roots),
        extensionTree
    });
};

const mergeExtensionConcepts = (state: ConceptsState, extensionTree: ConceptMap): ConceptsState => {
    const ext = extensionTree as Map<string, ExtensionConcept>;

    for (const c of ext) {
        const key = c[0];
        const val = c[1];
        let pre = state.currentTree.get(key);
        if (pre) {
            const merged = Object.assign( {}, val, { isOpen: pre.isOpen });
            state.currentTree.set(key, merged)
        } else {
            state.currentTree.set(key, val);
        }
    }

    state.extensionTree.forEach((c) => {
        if (!extensionTree.has(c.id)) {
            state.currentTree.delete(c.id);
        }
    });
    
    return Object.assign({}, state, {
        currentTree: state.currentTree,
        extensionTree
    });
};

const setExtensionConcept = (state: ConceptsState, extensionConcept: Concept): ConceptsState => {
    state.extensionTree.set(extensionConcept!.universalId!, extensionConcept!);
    state.currentTree.set(extensionConcept!.universalId!, extensionConcept!);
    return state;
};

const removeExtensionConcept = (state: ConceptsState, extensionConcept: Concept): ConceptsState => {
    state.extensionTree.delete(extensionConcept.id);
    state.currentTree.delete(extensionConcept.id);
    return state;
};

const setSelectedConcept = (state: ConceptsState, concept: Concept): ConceptsState => {
    state.allowRerender.add(state.selectedId);
    state.allowRerender.add(concept.id);
    return Object.assign({}, state, { selectedId: concept.id });
};

const createConcept = (state: ConceptsState, concept: Concept): ConceptsState => {
    state.currentTree.set(concept.id, concept);
    return Object.assign({}, state, { 
        currentTree: new Map(state.currentTree),
        roots: !concept.parentId 
            ? [ concept.id ].concat(state.roots) 
            : state.roots
    });
};

const removeConcept = (state: ConceptsState, concept: Concept): ConceptsState => {

    // Delete concept directly
    state.currentTree.delete(concept.id);
    state.drillTree.delete(concept.id);
    state.searchTree.delete(concept.id);

    // Delete parent refs to concept
    if (concept.parentId) {
        const par1 = state.currentTree.get(concept.parentId);
        const par2 = state.drillTree.get(concept.id);
        const par3 = state.searchTree.get(concept.id);
        
        if (par1 && par1.childrenIds) { par1.childrenIds.delete(concept.id); }
        if (par2 && par2.childrenIds) { par2.childrenIds.delete(concept.id); }
        if (par3 && par3.childrenIds) { par3.childrenIds.delete(concept.id); }
    }

    return Object.assign({}, state, {
        currentTree: new Map(state.currentTree),
        roots: state.roots.filter((r) => r !== concept.id)
    });
};

const reparentConcept = (state: ConceptsState, concept: Concept, parentId: string): ConceptsState => {
    const newConcept = Object.assign({}, concept, { parentId });
    const newParent = Object.assign({}, state.currentTree.get(parentId), { isParent: true });
    const oldParent = Object.assign({}, state.currentTree.get(concept.parentId!));

    if (oldParent.isParent) {
        oldParent.isParent = oldParent.childrenIds!.size > 0;
        if (oldParent.childrenIds) {
            oldParent.childrenIds!.delete(concept.id);
        }
    }
    if (newParent.childrenIds) {
        newParent.childrenIds!.add(concept.id);
    } else {
        newParent.childrenIds = new Set([ concept.id ]);
    }

    state.currentTree.set(oldParent.id, oldParent);
    state.currentTree.set(newParent.id, newParent);
    state.currentTree.set(newConcept.id, newConcept);

    if (state.searchTree.has(concept.id)) {
        state.searchTree.set(oldParent.id, oldParent);
        state.searchTree.set(newParent.id, newParent);
        state.searchTree.set(newConcept.id, newConcept);
    }

    return Object.assign({}, state, {
        currentTree: new Map(state.currentTree),
        searchTree: new Map(state.searchTree),
        roots: newConcept.parentId 
            ? state.roots.slice().filter((r) => r !== concept.id) 
            : state.roots
    });
};

export const concepts = (state: ConceptsState = defaultConceptsState(), action: ConceptsAction): ConceptsState => {
    switch (action.type) {
        case TOGGLE_CONCEPT_OPEN:
            return toggleConceptOpen(state, action.concept!);
        case REQUEST_CONCEPT_CHILDREN:
            return requestConceptChildren(state, action.concept!);
        case RECEIVE_CONCEPT_CHILDREN:
            return receiveConceptChildren(state, action.concept!, action.children!);
        case SET_ROOT_CONCEPTS:
            return addRootConcepts(state, action.concepts!);
        case REQUEST_SEARCH_TREE:
            return requestSearchTree(state);
        case SET_SEARCH_TREE:
            return receiveSearchTree(state, action.concepts!);
        case SHOW_DRILL_TREE:
            return showDrillTree(state);
        case SET_CONCEPT:
        case SET_CONCEPTS:
            return addConcepts(state, action.concepts!);
        case SET_EXTENSION_CONCEPTS:
            return setExtensionConcepts(state, action.conceptMap!, action.roots!);
        case SET_EXTENSION_CONCEPT:
            return setExtensionConcept(state, action.concept!);
        case REMOVE_EXTENSION_CONCEPT:
            return removeExtensionConcept(state, action.concept!);
        case MERGE_EXTENSION_CONCEPTS:
            return mergeExtensionConcepts(state, action.conceptMap!)
        case SET_SELECTED_CONCEPT:
            return setSelectedConcept(state, action.concept!);
        case REMOVE_CONCEPT:
            return removeConcept(state, action.concept!);
        case REPARENT_CONCEPT:
            return reparentConcept(state, action.concept!, action.parentId!);
        case CREATE_CONCEPT:
            return createConcept(state, action.concept!);
        case ERROR_CONCEPTS:
        default:
            return state;
    }
};