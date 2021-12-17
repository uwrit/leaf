/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
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
    SET_EXTENSION_ROOT_CONCEPTS,
    SET_EXTENSION_CONCEPT,
    SET_SELECTED_CONCEPT,
    REPARENT_CONCEPT,
    DELETE_ALL_EXTENSION_CONCEPTS,
    SHOW_DRILL_TREE,
    TOGGLE_CONCEPT_OPEN,
    REMOVE_CONCEPT,
    CREATE_CONCEPT,
    SWITCH_CONCEPTS
} from '../actions/concepts';
import { ConceptsAction } from '../actions/concepts';
import { ConceptMap, ConceptsState } from '../models/state/AppState';
import { Concept } from '../models/concept/Concept';
import { getRootId } from '../utils/admin/concept';
import { isNonstandard } from '../utils/panelUtils';

export const defaultConceptsState = (): ConceptsState => {
    return {
        allowRerender: new Set<string>(),
        currentTree: new Map<string, Concept>(),
        drillTree: new Map<string, Concept>(),
        requestingSearchTree: false,
        roots: [],
        searchTree: new Map<string, Concept>(),
        selectedId: '',
        showSearchTree: false
    };
};

const getAncestors = (concept: Concept, cache: ConceptMap, forceRerender: string[] = []): Set<string> => {
    const updateChain = new Set([concept.id].concat(forceRerender));
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
    const forceRerender: string[] = [];

    // Make sure all children of newly opened concept are closed to
    // prevent odd rendering issues (if they were previously opened but
    // a grandparent concept was closed, we automatically unrendered them,
    // so make sure they are closed to avoid confusing the user)
    if (newConcept.isOpen && newConcept.childrenLoaded) {
        for (const childId of newConcept.childrenIds!) {
            const childConcept = state.currentTree.get(childId);
            if (childConcept && childConcept.isOpen) {
                const clone = Object.assign({}, childConcept, { isOpen: false });
                updated.push(clone);
                forceRerender.push(clone.id);
            }
        }
    }
    return Object.assign({}, addConcepts(state, updated), {
        allowRerender: getAncestors(concept, state.currentTree, forceRerender)
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
    const combined = new Map(state.drillTree);
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
    cons.forEach(c => {
        state.currentTree.set(c.id, Object.assign({}, c));
    });
    return Object.assign({}, state, {
        allowRerender: new Set(cons.map(c => c.id)),
        currentTree: new Map(state.currentTree) 
    });
};


const setExtensionRootConcepts = (state: ConceptsState, roots: Concept[]): ConceptsState => {
    roots.forEach(c => state.currentTree.set(c.id, c));
    return Object.assign({}, state, {
        currentTree: new Map(state.currentTree),
        roots: [ ...new Set(state.roots.slice().concat(roots.map(r => r.id))) ],
    });
};

const setExtensionConcept = (state: ConceptsState, extensionConcept: Concept): ConceptsState => {
    state.currentTree.set(extensionConcept!.universalId!, extensionConcept!);
    return state;
};

const deleteAllExtensionConcepts = (state: ConceptsState): ConceptsState => {
    const mapped: [ string, Concept][] = [ ...state.currentTree.values() ]
        .filter(c => !isNonstandard(c.universalId))
        .map(c => [c.id, { 
            ...c, 
            childrenIds: !c.childrenIds 
                ? undefined 
                : new Set([...c.childrenIds].filter(id => !isNonstandard(id)))
        }])
    return Object.assign({}, state, { 
        currentTree: new Map(mapped),
        roots: state.roots.slice()
    });
};

const setSelectedConcept = (state: ConceptsState, concept: Concept): ConceptsState => {
    state.allowRerender.add(state.selectedId);
    state.allowRerender.add(concept.id);
    return Object.assign({}, state, { selectedId: concept.id });
};

const createConcept = (state: ConceptsState, concept: Concept): ConceptsState => {
    state.currentTree.set(concept.id, concept);

    if (concept.parentId) {
        const parent = state.currentTree.get(concept.parentId);
        if (parent) {
            const childrenIds = parent.childrenIds 
                ? new Set<string>([ ...parent.childrenIds, concept.id ])
                : new Set<string>([ concept.id ]);
            state.currentTree.set(parent.id, Object.assign({}, parent, { childrenIds, isParent: true, isOpen: true }));
            concept.rootId = getRootId(parent, state.currentTree);
        }
    }

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
    const parent = state.currentTree.get(parentId)!;
    const newConcept = Object.assign({}, concept, { parentId });
    const newParent = Object.assign({}, parent, { isParent: true, isOpen: !parent.isParent });
    const oldParent = Object.assign({}, state.currentTree.get(concept.parentId!));

    /*
     * Remove the Concept as a child of the previous parent.
     */
    if (oldParent.isParent) {
        if (oldParent.childrenIds) {
            oldParent.childrenIds!.delete(concept.id);
            oldParent.isParent = oldParent.childrenIds!.size > 0;
        }
    }

    /*
     * Add the Concept as a child of the new parent.
     */
    if (newParent.childrenIds) {
        newParent.childrenIds!.add(concept.id);
        newParent.isOpen = true;
    } else {
        newParent.childrenIds = new Set([ concept.id ]);
    }

    /*
     * Update the tree with all updated Concepts.
     */
    state.currentTree.set(oldParent.id, oldParent);
    state.currentTree.set(newParent.id, newParent);
    state.currentTree.set(newConcept.id, newConcept);
    newConcept.rootId = getRootId(newConcept, state.currentTree);

    if (state.searchTree.has(concept.id)) {
        state.searchTree.set(oldParent.id, oldParent);
        state.searchTree.set(newParent.id, newParent);
        state.searchTree.set(newConcept.id, newConcept);
    }

    return Object.assign({}, state, {
        currentTree: new Map(state.currentTree),
        drillTree: new Map(state.drillTree),
        searchTree: new Map(state.searchTree),
        roots: state.roots.slice().filter((r) => r !== concept.id)
    });
};

const switchConcepts = (state: ConceptsState, concepts: Concept[]): ConceptsState => {
    const [ oldConcept, newConcept ] = concepts;

    if (oldConcept.parentId && oldConcept.parentId === newConcept.parentId) {

        /*
         * Update Current tree.
         */
        let parent = state.currentTree.get(oldConcept.parentId);

        if (parent && parent.childrenIds) {
            const children = [ ...parent.childrenIds ];
            const oldIdx = children.slice().findIndex((c) => oldConcept.id === c);
            if (oldIdx > -1) {
                children.splice(oldIdx, 1, newConcept.id);
            } else {
                children.unshift(newConcept.id);
            }
            parent.childrenIds = new Set(children);
        }

        /*
         * Update Search tree.
         */
        parent = state.searchTree.get(oldConcept.parentId);

        if (parent && parent.childrenIds) {
            const children = [ ...parent.childrenIds ];
            const oldIdx = children.slice().findIndex((c) => oldConcept.id === c);
            if (oldIdx > -1) {
                children.splice(oldIdx, 1, newConcept.id);
            } else {
                children.unshift(newConcept.id);
            }
            parent.childrenIds = new Set(children);
        }

        /*
         * Update Drilldown tree.
         */
        parent = state.drillTree.get(oldConcept.parentId);

        if (parent && parent.childrenIds) {
            const children = [ ...parent.childrenIds ];
            const oldIdx = children.slice().findIndex((c) => oldConcept.id === c);
            if (oldIdx > -1) {
                children.splice(oldIdx, 1, newConcept.id);
            } else {
                children.unshift(newConcept.id);
            }
            parent.childrenIds = new Set(children);
        }

        state.currentTree.delete(oldConcept.id);
        state.searchTree.delete(oldConcept.id);
        state.drillTree.delete(oldConcept.id);
        state.currentTree.set(newConcept.id, newConcept);
        state.searchTree.set(newConcept.id, newConcept);
        state.drillTree.set(newConcept.id, newConcept);

        return Object.assign({}, state, {
            currentTree: new Map(state.currentTree)
        });

    } else {
        if (oldConcept.parentId) { state.roots = state.roots.slice().filter((r) => r !== oldConcept.id) }
        if (newConcept.parentId) { state.roots = state.roots.slice().filter((r) => r !== newConcept.id) }
        return createConcept( removeConcept(state, oldConcept), newConcept);
    }
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
        case SET_EXTENSION_ROOT_CONCEPTS:
            return setExtensionRootConcepts(state, action.concepts!);
        case SET_EXTENSION_CONCEPT:
            return setExtensionConcept(state, action.concept!);
        case DELETE_ALL_EXTENSION_CONCEPTS:
            return deleteAllExtensionConcepts(state);
        case SET_SELECTED_CONCEPT:
            return setSelectedConcept(state, action.concept!);
        case REMOVE_CONCEPT:
            return removeConcept(state, action.concept!);
        case REPARENT_CONCEPT:
            return reparentConcept(state, action.concept!, action.parentId!);
        case CREATE_CONCEPT:
            return createConcept(state, action.concept!);
        case SWITCH_CONCEPTS:
            return switchConcepts(state, action.concepts!);
        case ERROR_CONCEPTS:
        default:
            return state;
    }
};