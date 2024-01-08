/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { generate as generateId } from 'shortid';
import { Note, NoteDatasetContext } from '../../models/cohort/NoteSearch';
import { workerContext } from './noteSearchWebWorkerContext';
import { NoteSearchConfiguration, NoteSearchTerm } from '../../models/state/CohortState';
import { PatientListDatasetDynamicSchema } from '../../models/patientList/Dataset';

const SEARCH = 'SEARCH';
const INDEX = 'INDEX';
const FLUSH = 'FLUSH';
const HINT = 'HINT'

interface InboundMessagePartialPayload {
    config?: NoteSearchConfiguration;
    datasets?: NoteDatasetContext[];
    message: string;
    terms?: NoteSearchTerm[];
    prefix?: string;
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

interface Indices {
    start: number;
    end: number;
}

interface TokenInstance {
    charIndex: Indices;
    docId: string;
    id: string;
    lexeme: string;
    lineIndex: number;
    index: number;
    nextId?: string;
}

interface TokenPointer {
    instances: TokenInstance[];
    lexeme: string;
    next: Map<string, TokenPointer>;
}

interface SearchHit {
    charIndex: Indices;
    docId: string;
    lineIndex: number;
    searchTerm: NoteSearchTerm;
}

interface IndexedDocument {
    id: string;
    date?: Date;
    personId: string;
    text: string;
    note_type: string;
}

export interface DocumentSearchResult extends IndexedDocument {
    lines: DocumentSearchResultLine[]
}

interface DocumentSearchResultLine {
    content: (TextContext | TextSearchResult)[];
    index: number;
}

interface TextSearchResult {
    matchedTerm: NoteSearchTerm;
    text: string;
    type: 'MATCH';
}

interface TextContext {
    text: string;
    type: 'CONTEXT';
}

interface RadixNode {
    children: { [key: string]: RadixNode };
    isEndOfWord: boolean;
}

export interface NoteSearchResult {
    documents: DocumentSearchResult[];
    totalDocuments: number;
    totalPatients: number;
    totalTermHits: number;
}

export interface RadixTree {
    tree: RadixNode;
}

export interface RadixTreeResult {
    prefix: string;
    result: string[];
}

export default class NoteSearchWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([INDEX, FLUSH, SEARCH, HINT])}
            ${workerContext}
            self.onmessage = function(e) {  
                self.postMessage(handleWorkMessage.call(this, e.data, postMessage)); 
            }`;
        //console.log(workerFile);
        // ${this.stripFunctionToContext(this.workerContext)}
        const blob = new Blob([workerFile], { type: 'text/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        this.worker.onmessage = result => this.handleReturnPayload(result);
        this.worker.onerror = error => { console.log(error) };
    }

    //${this.stripFunctionToContext(this.workerContext)}

    public search = (config: NoteSearchConfiguration, terms: NoteSearchTerm[]) => {
        return this.postMessage({ message: SEARCH, config, terms });
    }

    public index = (datasets: NoteDatasetContext[]) => {
        return this.postMessage({ message: INDEX, datasets });
    }

    public flush = () => {
        return this.postMessage({ message: FLUSH });
    }

    public searchPrefix = (prefix: string) => {
        return this.postMessage({ message: HINT, prefix });
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

    /*private handleReturnPayload = (payload: WorkerReturnPayload): any => {  
        const data = payload.data.result ? payload.data.result : {}  
        const resolve = this.promiseMap.get(payload.data.requestId)!.resolve;  
        this.promiseMap.delete(payload.data.requestId);  
        if (payload.data.result && payload.data.result.tree) {  
            // dispatch an action to update the radix tree in the state  
            dispatch(setNoteSearchRadixTree(payload.data.result.tree));  
        }  

        return resolve(data);  
    }*/

    private stripFunctionToContext = (f: () => any) => {
        const funcString = `${f}`;
        return funcString
            .substring(0, funcString.lastIndexOf('}'))
            .substring(funcString.indexOf('{') + 1)
    }

    private addMessageTypesToContext = (messageTypes: string[]) => {
        return messageTypes.map((v: string) => `var ${v} = '${v}';`).join(' ');
    }

    private workerContext = () => {
        const STOP_WORDS = new Set(['\n', '\t', '(', ')', '"', ";"]);

        let resultsCache: NoteSearchResult;
        let resultsCacheTerms = '';
        let unigramIndex: Map<string, TokenPointer> = new Map();
        let docIndex: Map<string, IndexedDocument> = new Map();

        // eslint-disable-next-line
        const handleWorkMessage = (payload: InboundMessagePayload): any => {
            switch (payload.message) {
                case INDEX:
                    return indexDocuments(payload);
                case FLUSH:
                    return flushNotes(payload);
                case SEARCH:
                    return searchNotes(payload);
                default:
                    return null;
            }
        };

        const indexDocuments = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId } = payload;
            const { datasets } = payload;
            const notes: Note[] = [];
            const patients = new Set();

            /* Process as notes */
            for (let i = 0; i < datasets.length; i++) {
                const result = datasets[i];
                const schema = result.dataset.schema as PatientListDatasetDynamicSchema
                let j = 0;
                for (const patId of Object.keys(result.dataset.results)) {
                    if (!patients.has(patId)) {
                        patients.add(patId);
                    }
                    for (const row of result.dataset.results[patId]) {
                        const note: Note = {
                            responderId: result.responder.id,
                            id: result.responder.id + '_' + j.toString(),
                            date: row[schema.sqlFieldDate],
                            personId: patId,
                            text: row[schema.sqlFieldValueString],
                            type: result.query.name
                        };
                        notes.push(note);
                        j++;
                    }
                }
            }

            /* Index text */
            for (let i = 0; i < notes.length; i++) {
                const note = notes[i];
                const tokens = tokenizeDocument(note);
                const doc: IndexedDocument = { 
                    id: note.id, 
                    date: note.date ? new Date(note.date) : undefined, 
                    note_type: note.type, 
                    text: note.text, 
                    personId: note.personId 
                };
                let prev: TokenPointer;

                for (let j = 0; j < tokens.length; j++) {
                    const token = tokens[j];
                    const lexeme = token.lexeme;


                    if (STOP_WORDS.has(lexeme)) continue;

                    // Radix-tree check

                    let indexed = unigramIndex.get(lexeme);

                    if (indexed) {
                        indexed.instances.push(token);
                    } else {
                        indexed = { lexeme, instances: [token], next: new Map() };
                        unigramIndex.set(lexeme, indexed);
                    }

                    if (prev) {
                        let prevIndexed = prev.next.get(lexeme);
                        if (!prevIndexed) {
                            prev.next.set(lexeme, indexed);
                        }
                    }
                    prev = indexed;
                }
                docIndex.set(doc.id, doc);
            }

            resultsCache = { 
                documents: [], 
                totalDocuments: notes.length, 
                totalPatients: patients.size, 
                totalTermHits: 0 
            };

            return { requestId, result: resultsCache };
        }

        const flushNotes = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId } = payload;
            unigramIndex.clear();
            docIndex.clear();
            return { requestId };
        };

        const returnPaginatedResults = (config: NoteSearchConfiguration): NoteSearchResult => {
            const offset = config.pageNumber * config.pageSize;
            const sliced = resultsCache.documents.slice(offset, offset + config.pageSize);
            return { ...resultsCache, documents: sliced };
        }

        const searchNotes = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId, config, terms } = payload;
            const result: NoteSearchResult = { documents: [], totalDocuments: 0, totalPatients: 0, totalTermHits: 0 };
            const searchTerms = terms.join("_");
            let precedingHits: Map<string, SearchHit[]> = new Map();

            /**
             * If user simply paginating, return cached results
             **/
            if (resultsCache && searchTerms === resultsCacheTerms) {
                return { requestId, result: returnPaginatedResults(config) };
            }

            for (let i = 0; i < terms.length; i++) {
                const term = terms[i];
                const hits = search(term);

                if (!hits.size) return { requestId, result };

                if (precedingHits.size) {
                    const merged: Map<string, SearchHit[]> = new Map();
                    precedingHits.forEach((v, k) => {
                        if (hits.has(k)) {
                            const both = hits.get(k)!.concat(v);
                            merged.set(k, both);
                        }
                    });
                    precedingHits = merged;
                } else {
                    precedingHits = hits;
                }
            }

            precedingHits.forEach((v, k) => {
                const doc: DocumentSearchResult = { ...docIndex.get(k)!, lines: [] };
                const hits = v.sort((a, b) => a.charIndex.start - b.charIndex.start);
                const context = getSearchResultDocumentContext(doc, hits);
                result.documents.push(context);
                result.totalTermHits += hits.length;
            });
            result.totalPatients = new Set(result.documents.map(d => d.personId)).size;
            result.totalDocuments = result.documents.length;

            resultsCache = result;
            resultsCacheTerms = searchTerms;

            return { requestId, result: returnPaginatedResults(config) };
        }

        const getSearchResultDocumentContext = (doc: DocumentSearchResult, hits: SearchHit[]): DocumentSearchResult => {
            const contextCharDistance = 50;
            const groups: SearchHit[][] = [];

            // Group by character distance
            for (let i = 0; i < hits.length; i++) {
                const hit = hits[i];
                const group: SearchHit[] = [hit];

                let nextIndex = 1;
                while (true) {
                    const nextHit = i < hits.length - 1 ? hits[i + nextIndex] : undefined;

                    // If overlapping
                    if (nextHit && hit.lineIndex === nextHit.lineIndex &&
                        (hit.charIndex.end + contextCharDistance) >= (nextHit.charIndex.start - contextCharDistance)) {

                        // Merge lines
                        group.push(nextHit);
                        hits.splice(i + nextIndex, 1);
                        nextIndex++;
                    } else {
                        groups.push(group);
                        break;
                    }
                }
            }

            const result: DocumentSearchResult = { ...doc, lines: [] };

            for (let i = 0; i < groups.length; i++) {
                const group = groups[i];
                let line: DocumentSearchResultLine = { index: group[0].lineIndex, content: [] };
                for (let j = 0; j < group.length; j++) {
                    const backLimit = j > 0 ? group[j].charIndex.start : undefined;
                    const forwLimit = j < group.length - 1 ? group[j + 1].charIndex.start : undefined;
                    const context = getContext(doc, group[j], contextCharDistance, backLimit, forwLimit);
                    line.content = line.content.concat(context);
                }
                result.lines.push(line);
            }

            return result;
        };

        const getContext = (doc: DocumentSearchResult, hit: SearchHit, contextCharDistance: number,
            backLimit?: number, forwLimit?: number): (TextContext | TextSearchResult)[] => {

            const _backLimit = backLimit === undefined ? hit.charIndex.start - contextCharDistance : backLimit;
            const _forwLimit = forwLimit === undefined ? hit.charIndex.end + contextCharDistance : forwLimit;
            let backContext = doc.text.substring(_backLimit, hit.charIndex.start);
            let forwContext = doc.text.substring(hit.charIndex.end, _forwLimit);

            if (!backLimit && backContext) backContext = '...' + backContext;
            if (!forwLimit && forwContext) forwContext += '...';

            let back_i = backContext.length - 1;
            while (back_i > -1) {
                if (backContext[back_i] === '\n') {
                    backContext = backContext.substring(back_i, backContext.length - 1);
                    break;
                }
                back_i--;
            }
            let forw_i = 1;
            while (forw_i < forwContext.length - 1) {
                if (forwContext[forw_i] === '\n') {
                    forwContext = forwContext.substring(0, forw_i);
                    break;
                }
                forw_i++;
            }

            const output: (TextContext | TextSearchResult)[] = [
                { type: "MATCH", text: doc.text.substring(hit.charIndex.start, hit.charIndex.end), matchedTerm: hit.searchTerm }
            ];
            if (backContext.trim()) output.unshift({ type: "CONTEXT", text: backContext });
            if (forwContext.trim()) output.push({ type: "CONTEXT", text: forwContext });

            return output;
        };

        const searchSingleTerm = (term: NoteSearchTerm): Map<string, SearchHit[]> => {
            const result: Map<string, SearchHit[]> = new Map();
            const hit = unigramIndex.get(term.text.toLocaleLowerCase());

            if (hit) {
                for (let i = 0; i < hit.instances.length; i++) {
                    const instance = hit.instances[i];
                    if (result.has(instance.docId)) {
                        result.get(instance.docId)!.push({ ...instance, searchTerm: term });
                    } else {
                        result.set(instance.docId, [{ ...instance, searchTerm: term }]);
                    }
                }
            }
            return result;
        };

        const searchMultiterm = (searchTerm: NoteSearchTerm): Map<string, SearchHit[]> => {
            const result: Map<string, SearchHit[]> = new Map();
            const terms = searchTerm.text.toLocaleLowerCase().split(' ');

            // First term
            const term = terms[0];
            const hit = unigramIndex.get(term);

            if (!hit) return result;
            let expected = new Map(hit.instances.filter(t => !!t.nextId).map(t => [t.nextId!, [t]]));
            let next = hit.next;

            // Following
            for (let j = 1; j < terms.length; j++) {
                const term = terms[j];
                const hit = next.get(term);
                if (hit) {
                    let matched = hit.instances.filter(t => expected.has(t.id));
                    if (!matched.length) return result;

                    if (j < terms.length - 1) {
                        expected = new Map(matched.filter(t => !!t.nextId).map(t => [t.nextId!, [...expected.get(t.id), t]]));
                        next = hit.next;
                    } else {
                        expected = new Map(matched.map(t => [t.id, [...expected.get(t.id), t]]));
                    }
                } else {
                    return result;
                }
            }

            expected.forEach((v, k) => {
                const docId = v[0].docId;
                const charIndex = { start: v[0].charIndex.start, end: v[v.length - 1].charIndex.end };
                const lineIndex = v[0].lineIndex;

                if (result.has(docId)) {
                    result.get(docId)!.push({ docId, charIndex, lineIndex, searchTerm });
                } else {
                    result.set(docId, [{ docId, charIndex, lineIndex, searchTerm }]);
                }
            });

            return result;
        };

        const getHitPointers = (term: string): TokenPointer => {
            const cleaned = term.trim().toLocaleLowerCase();
 
            if (cleaned.startsWith('(') && cleaned.indexOf(')') > -1) {
                return getParenHitPointers(cleaned);
            }
            if (cleaned.indexOf('|') > -1 && cleaned.indexOf('(') === -1 && cleaned.indexOf(')') === -1) {
               return getOrHitPointers(cleaned.split('|').filter(t => t.trim().length));
            }
            if (cleaned.indexOf(' ') > -1) {
                return getSequenceHitPointers(cleaned);
            }
            if (cleaned.indexOf('*') > -1) {
                return getWildcardHitPointers(cleaned);
            }
 
            const direct = unigramIndex.get(cleaned);
            if (!direct) {
                return {
                    instances: [], lexeme: term, next: new Map()
                }
            }
            return direct;
        }
 
        const getWildcardHitPointers = (term: string): TokenPointer => {
            const startsWith = [ ...unigramIndex.values() ].filter(v => v.lexeme.startsWith(term.replace('*', '')));
            return unionPointers(startsWith);
        }
 
        const getOrHitPointers = (terms: string[]): TokenPointer => {
            const pointers = terms.map(t => getHitPointers(t));
            return unionPointers(pointers);
        }
 
        const getParenHitPointers = (term: string): TokenPointer => {
            const firstOpenParen = term.indexOf('(');
            const lastCloseParen = term.lastIndexOf(')');
            const unparened = term.substring(firstOpenParen + 1, lastCloseParen);
            return getHitPointers(unparened);
        }
 
        const splitTerms = (term: string): string[] => {
            const cleanedTerm = term.trim();
            const terms: string[] = [];
            let current = 0;
            let lastAdd = 0;
            while (current < cleanedTerm.length) {
                const c = cleanedTerm[current];
                if (c === '(') {
                    const currentTextWindow = cleanedTerm.substring(current)
                    let closeParenIndex = currentTextWindow.lastIndexOf(')');
                    if (closeParenIndex > -1) {
                        closeParenIndex += current;
                        const precedingText = cleanedTerm.substring(lastAdd, current).trim();
                        const parentText = cleanedTerm.substring(current, closeParenIndex + 1).trim()
                        terms.push(precedingText);
                        terms.push(parentText)
                        lastAdd = closeParenIndex + 1;
                        current = closeParenIndex;
                    } else {
                        break;
                    }
                }
                current++;
            }
            if (terms.length) {
                if (lastAdd < cleanedTerm.length - 1) {
                    terms.push(cleanedTerm.substring(lastAdd));
                }
                return terms
                    .map(t => t.indexOf('(') === -1 ? t.split(' ') : [t])
                    .flatMap(t => t)
                    .filter(t => t.trim().length)
            }
            if (cleanedTerm.indexOf('|') === -1) {
                return cleanedTerm.split(' ').filter(t => t.length);
            }
            return [cleanedTerm];
        }
 
        const getSequenceHitPointers = (searchTerm: string): TokenPointer => {
            const terms = splitTerms(searchTerm);
            const output: TokenPointer = {
                instances: [],
                lexeme: searchTerm,
                next: new Map()
            };
 
            // First term
            const term = terms[0];
            const hit = getHitPointers(term);
 
            if (!hit) return output;
            let expected = new Map(hit.instances.filter(t => !!t.nextId).map(t => [t.nextId!, [t]]));
            let next = hit.next;
 
            // Following
            for (let j = 1; j < terms.length; j++) {
                const term = terms[j];
                if (STOP_WORDS.has(term)) {
                    continue;
                }
                const hit = getHitPointers(term);
                if (hit) {
                    let matched = hit.instances.filter(t => expected.has(t.id));
                    if (!matched.length) return output;
 
                    if (j < terms.length-1) {
                        expected = new Map(matched.filter(t => !!t.nextId).map(t => [t.nextId!, [...expected.get(t.id), t]]));
                        next = hit.next;
                    } else {
                        expected = new Map(matched.map(t => [t.id, [...expected.get(t.id), t]]));
                    }
                } else {
                    return output;
                }
            }
 
            expected.forEach((v,k) => {
                const e = expected.get(k);
                const last = v[v.length-1];
                expected.set(k, [{ ...e[0], charIndex: { start: e[0].charIndex.start, end: last.charIndex.end }, nextId: last.nextId }]);
            });
 
            output.instances = [ ...expected.values() ].map(v => v[0]);
            return output;
        }
 
        const unionPointers = (pointers: TokenPointer[]): TokenPointer => {
            const instances = pointers.flatMap(v => v.instances);
           
            const next: Map<string, TokenPointer> = new Map();
            for (const pointer of pointers) {
                const current = next.get(pointer.lexeme);
                if (current) {
                    current.instances = current.instances.concat(pointer.instances);
                } else {
                    next.set(pointer.lexeme, pointer);
                }
            }
           
            return {
                instances,
                lexeme: pointers.map(p => p.lexeme).join(' | '),
                next
            };
        }
 
        const search = (term: NoteSearchTerm): Map<string, SearchHit[]> => {
            const result: Map<string, SearchHit[]> = new Map();
            const hit = getSequenceHitPointers(term.text);
 
            if (hit) {
                for (let i = 0; i < hit.instances.length; i++) {
                    const instance = hit.instances[i];
 
                    if (result.has(instance.docId)) {
                        result.get(instance.docId)!.push({ ...instance, searchTerm: term });
                    } else {
                        result.set(instance.docId, [{ ...instance, searchTerm: term }]);
                    }
                }
            }
            return result;
        };

        const tokenizeDocument = (note: Note) => {
            const source = note.text.toLocaleLowerCase();
            const tokens: TokenInstance[] = [];
            const spaces = new Set([' ', '\n', '\t', '\r']);
            let line = 0;
            let start = 0;
            let current = 0;

            const scanToken = () => {
                const c = advance();

                switch (c) {
                    case ' ':
                    case '\r':
                    case '\t':
                        break;

                    case '\n':
                        toNewLine();
                        break;

                    default:
                        toToken();
                        break;
                }
            };

            const toNewLine = () => {
                line++;
            };

            const toToken = () => {
                while (!isSpecialCharacter(peek()) && isAlphaNumeric(peek())) advance();
                addToken();
            };

            const peek = () => {
                if (isAtEnd()) return '\0';
                return source[current];
            };

            const isAlpha = (c: string): Boolean => {
                return (c >= 'a' && c <= 'z') ||
                    (c >= 'A' && c <= 'Z');
            };

            const isAlphaNumeric = (c: string) => {
                return isAlpha(c) || isDigit(c);
            };

            const isDigit = (c: string) => {
                return c >= '0' && c <= '9';
            };

            const isAtEnd = () => {
                return current >= source.length;
            };

            const isSpecialCharacter = (c: string): Boolean => {
                return !isAlphaNumeric(c);
            };

            const advance = () => {
                return source[current++];
            };

            const addToken = () => {
                const text = source.substring(start, current);
                const token: TokenInstance = {
                    lexeme: text,
                    charIndex: { start, end: current },
                    docId: note.id,
                    id: note.id + '_' + tokens.length.toString(),
                    index: tokens.length,
                    lineIndex: line
                };
                if (tokens.length) {
                    const prev = tokens[tokens.length - 1];
                    if (prev.lineIndex === token.lineIndex) {
                        tokens[tokens.length - 1].nextId = token.id;
                    }
                }
                tokens.push(token);
            };

            while (!isAtEnd()) {
                start = current;
                scanToken();
            }
            return tokens;
        };
    }
}