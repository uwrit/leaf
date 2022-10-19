/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';
import { Note } from '../../models/cohort/NoteSearch';
import { NoteSearchResult } from '../../models/state/CohortState';

const SEARCH = 'SEARCH';
const INDEX = 'INDEX';
const FLUSH = 'FLUSH';

interface InboundMessagePartialPayload {
    message: string;
    notes?: Note[];
    terms?: string[];
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

interface TestIndexedNote {
    lines: TestIndexedNoteLine[];
    note: Note;
}

interface TestIndexedNoteLine {
    index: number;
    text: string;
}

export default class NoteSearchWebWorker {
    private worker: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    constructor() {
        const workerFile = `  
            ${this.addMessageTypesToContext([ INDEX, FLUSH, SEARCH ])}
            ${this.stripFunctionToContext(this.workerContext)}
            self.onmessage = function(e) {  
                self.postMessage(handleWorkMessage.call(this, e.data, postMessage)); 
            }`;
        // console.log(workerFile);
        const blob = new Blob([workerFile], { type: 'text/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        this.worker.onmessage = result => this.handleReturnPayload(result);
        this.worker.onerror = error => { console.log(error); this.reject(error) };
    }

    public search = (terms: string[]) => {
        return this.postMessage({ message: SEARCH, terms });
    }

    public index = (notes: Note[]) => {
        return this.postMessage({ message: INDEX, notes });
    }

    public flush = () => {
        return this.postMessage({ message: FLUSH });
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
            .substring(funcString.indexOf('{') + 1)
    }

    private addMessageTypesToContext = (messageTypes: string[]) => {
        return messageTypes.map((v: string) => `var ${v} = '${v}';`).join(' ');
    }

    private workerContext = () => {

        let index: TestIndexedNote[] = [];

        // eslint-disable-next-line
        const handleWorkMessage = (payload: InboundMessagePayload): any => {
            switch (payload.message) {
                case INDEX:
                    return indexNotes(payload);
                case FLUSH:
                    return flushNotes(payload);
                case SEARCH:
                    return search(payload);
                default:
                    return null;
            }
        };

        const indexNotes = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId } = payload;

            // Dumb, not really indexing, just storing, as an example
            for (let i = 0; i < payload.notes!.length; i++) {
                const note = payload.notes[i];
                const lines = note.text.split('\n').map((n, i) => ({ index: i, text: n }));
                index.push({ note, lines });
            }
            console.log(index);

            return { requestId }
        };

        const flushNotes = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId } = payload;

            index = [];
            return { requestId }
        };

        const search = (payload: InboundMessagePayload): OutboundMessagePayload => {
            const { requestId, terms } = payload;
            const result: NoteSearchResult[] = [];

            // Dumb, brute force approach as an example
            for (let i = 0; i < index.length; i++) {
                const note = index[i];
                for (let j = 0; j < note.lines.length; j++) {
                    const line = note.lines[j];
                    for (let k = 0; k < terms.length; k++) {
                        const term = terms[k];
                        if (line.text.indexOf(term) > -1) {
                            result.push({ note: note.note });
                            continue;
                        }
                    }
                }
            }

            return { requestId, result }
        };
    }
}