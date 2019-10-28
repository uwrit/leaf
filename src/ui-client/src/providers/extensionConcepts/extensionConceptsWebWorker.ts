/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { SavedQueryRef } from '../../models/Query';
import { Concept, ConceptExtensionType, ExtensionConcept } from '../../models/concept/Concept';
import { workerContext } from './extensionConceptsWebWorkerContext';
import { ImportMetadata, ImportType, REDCapImportStructure } from '../../models/dataImport/ImportMetadata';

const ADD_SAVED_COHORT = 'ADD_SAVED_COHORT';
const SEARCH_SAVED_COHORTS = 'SEARCH_SAVED_COHORTS';
const BUILD_EXTENSION_TREE = 'BUILD_EXTENSION_TREE';
const LOAD_EXTENSION_CONCEPT_CHILDREN = 'LOAD_EXTENSION_CONCEPT_CHILDREN';

const savedQueryType = ConceptExtensionType.SavedQuery;
const redcapImportType = ConceptExtensionType.REDCapImport;
const mrnImportType = ConceptExtensionType.MRN;
const redcapImport = ImportType.REDCapProject;
const mrnImport = ImportType.MRN;

interface InboundMessagePartialPayload {
    concept?: ExtensionConcept;
    displayThreshhold?: number;
    imports?: ImportMetadata[];
    savedQuery?: SavedQueryRef;
    savedQueries?: SavedQueryRef[];
    message: string;
    rootId?: string;
    roots?: string[];
    searchString?: string;
}

interface InboundMessagePayload extends InboundMessagePartialPayload {
    requestId: string;
}

interface OutboundMessagePayload {
    requestId: string;
    result?: any;
}

interface WorkerReturnPayload {
    data: OutboundMessagePayload;
}

interface PromiseResolver {
    reject: any;
    resolve: any;
}

export default class ExtensionConceptsWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([ADD_SAVED_COHORT, BUILD_EXTENSION_TREE, SEARCH_SAVED_COHORTS,LOAD_EXTENSION_CONCEPT_CHILDREN])}
            ${workerContext}
            var redcapImport = ${redcapImport}
            var mrnImport = ${mrnImport}
            var savedQueryType = ${savedQueryType};
            var redcapImportType = ${redcapImportType};
            var mrnImportType = ${mrnImportType};
            self.onmessage = function(e) {  
                self.postMessage(handleWorkMessage.call(this, e.data, postMessage)); 
            }`;
        // console.log(workerFile);
        const blob = new Blob([workerFile], { type: 'text/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        this.worker.onmessage = result => this.handleReturnPayload(result);
        this.worker.onerror = error => { console.log(error); this.reject(error) };
    }

    public buildExtensionImportTree = (imports: ImportMetadata[], savedQueries: SavedQueryRef[]) => {
        return this.postMessage({ message: BUILD_EXTENSION_TREE, imports, savedQueries })
    }

    public searchSavedCohorts = (searchString: string) => {
        return this.postMessage({ message: SEARCH_SAVED_COHORTS, searchString });
    }

    public loadConceptChildren = (concept: ExtensionConcept) => {
        return this.postMessage({ message: LOAD_EXTENSION_CONCEPT_CHILDREN, concept });
    }

    private postMessage = (payload: InboundMessagePartialPayload) => {
        return new Promise((resolve, reject) => {
            const requestId = generateId();
            this.reject = reject;
            this.promiseMap.set(requestId, { resolve, reject });
            this.worker.postMessage({ ...payload, requestId });
        });
    }

    private handleReturnPayload = (payload: WorkerReturnPayload): any => {
        const data = payload.data.result ? payload.data.result : {}
        const resolve = this.promiseMap.get(payload.data.requestId)!.resolve;
        this.promiseMap.delete(payload.data.requestId);
        return resolve(data);
    }

    private stripFunctionToContext = (f: () => any) => {
        const funcString = `${f}`;
        return funcString
            .substring(0, funcString.lastIndexOf('}'))
            .substring(funcString.indexOf('{') + 1);
    }

    private addMessageTypesToContext = (messageTypes: string[]) => {
        return messageTypes.map((v: string) => `var ${v} = '${v}';`).join(' ');
    }

    private workerContext = () => {

        // eslint-disable-next-line
        const handleWorkMessage = (payload: InboundMessagePayload) => {
            switch (payload.message) {
                case BUILD_EXTENSION_TREE:
                    return buildExtensionImportTree(payload);
                case SEARCH_SAVED_COHORTS:
                    return search(payload);
                case LOAD_EXTENSION_CONCEPT_CHILDREN:
                    return loadExtensionChildrenConcepts(payload);
                default:
                    return null;
            }
        };

        let conceptMap: Map<string, ExtensionConcept> = new Map();

        const loadExtensionChildrenConcepts = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId, concept } = payload;
            const children: ExtensionConcept[] = [ ... conceptMap.values() ].filter(c => c.parentId === concept!.id)
            return { requestId, result: children };
        };

        /*
         * Build the extension concept tree map.
         */
        const buildExtensionImportTree = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId, imports, savedQueries } = payload;
            const redcap = imports!.filter(i => i.type === redcapImport);
            conceptMap = new Map();
            buildRedcapImportTree(redcap);
            buildSavedCohortTree(savedQueries!);
            const roots = [ ...conceptMap.values() ].filter(c => c.id.endsWith('root'));

            return { requestId, result: roots }
        };

        /*
         * Build the REDCap Import-specific concept tree map.
         */
        const buildRedcapImportTree = (redcapImports: ImportMetadata[]): void => {
            const rootId = `urn:leaf:import:redcap:root`;
            const root: ExtensionConcept = {
                ...getEmptyConcept(),
                id: rootId,
                universalId: rootId,
                isParent: true,
                injectChildrenOnDrop: [],
                uiDisplayName: 'REDCap Imports',
                extensionType: redcapImportType
            };

            for (let i = 0; i < redcapImports.length; i++) {
                const impt = redcapImports[i];
                const struct = impt.structure as REDCapImportStructure;

                // Set Concepts
                for (let j = 0; j < struct.concepts.length; j++) {
                    const conc = struct.concepts[j] as ExtensionConcept;
                    conc.childrenIds = undefined;
                    conc.childrenLoaded = false;
                    conc.extensionType = redcapImportType;
                    conc.extensionId = impt.id!;
                    conceptMap.set(conc.id, conc);
                }
            }
            conceptMap.set(root.id, root);
        };

        /*
         * Build a Map object to be unioned with the Concept tree
         * to search for and display saved cohorts in patient list.
         */
        const buildSavedCohortTree = (savedQueries: SavedQueryRef[]): void => {
            const all: ExtensionConcept[] = [];
            const catIds: Set<string> = new Set();
            const prefix = 'urn:leaf:query';
            const rootId = `${prefix}:root`;

            // For each saved query
            for (let i = 0; i < savedQueries.length; i++) {
                const query = savedQueries[i];
                const catId = `${prefix}:category:${query.category.toLowerCase()}`;
                const concept: ExtensionConcept = cohortToConcept(catId, query, rootId);

                // Add query concept
                conceptMap.set(concept.universalId!, concept);
                catIds.add(catId);
                all.push(concept);

                // Add category as concept
                if (conceptMap.has(catId)) {
                    const catConcept = conceptMap.get(catId)! as ExtensionConcept;
                    if (!catConcept.childrenIds!.has(concept.universalId!)) {
                        catConcept.injectChildrenOnDrop!.push(concept);
                        catConcept.childrenIds!.add(concept.universalId!);
                    }
                }
                else {
                    const newCatConcept = categoryToConcept(catId, query, rootId);
                    conceptMap.set(catId, newCatConcept);
                }
            }

            // Add root concept
            const root = getRootConcept(all, catIds, rootId) as ExtensionConcept;
            conceptMap.set(rootId, root);
        };

        const getEmptyConcept = (): ExtensionConcept => {
            return {
                extensionId: '',
                id:'',
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
        const cohortToConcept = (categoryId: string, query: SavedQueryRef, rootId: string): ExtensionConcept => {
            const concept = getEmptyConcept();
            concept.extensionType = savedQueryType;
            concept.extensionId = query.id;
            concept.id = query.universalId!;
            concept.universalId = query.universalId;
            concept.parentId = categoryId;
            concept.rootId = rootId;
            concept.uiDisplayName = query.name;
            concept.uiDisplayText = `Included in cohort "${query.name}"`;
            concept.uiDisplayPatientCount = query.count ? query.count : undefined;
            return concept;
        };

        /*
         * Returns a Concept to be displayed in UI for a given Saved Cohort.
         */ 
        const categoryToConcept = (categoryId: string, query: SavedQueryRef, rootId: string): ExtensionConcept => {
            const childrenOnDrop = conceptMap.get(query.universalId!)!
            const concept = getEmptyConcept();
            concept.extensionType = savedQueryType;
            concept.injectChildrenOnDrop = [ childrenOnDrop ];
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
        const getRootConcept = (children: Concept[], directChildrenIds: Set<string>, rootId: string): ExtensionConcept => {
            const concept = getEmptyConcept();
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

        const search = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId } = payload;
            return { requestId };
        };
    }
}