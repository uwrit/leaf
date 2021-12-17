/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { generate as generateId } from 'shortid';

export interface BaseInboundMessagePartialPayload {
    message: string;
}

export interface OutboundMessagePayload {
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

export interface LeafWebWorker {
    down: () => void;
    up: (messages: string[], workerContext: string) => void;
}

export default abstract class BaseWebWorker implements LeafWebWorker  {
    private worker!: Worker;
    private reject: any;
    private promiseMap: Map<string, PromiseResolver> = new Map();

    /*
     * Spin worker up.
     */
    public up = (messages: string[], workerContext: string): Worker => {
        const workerFile = `  
            ${this.addMessageTypesToContext(messages)}
            ${workerContext}
            self.onmessage = function(e) {  
                self.postMessage(handleWorkMessage.call(this, e.data, postMessage)); 
            }`;
        const blob = new Blob([workerFile], { type: 'text/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
        this.worker.onmessage = result => this.handleReturnPayload(result);
        this.worker.onerror = error => { console.log(error); this.reject(error) };
        return this.worker;
    }

    /*
     * Take worker down.
     */
    public down = () => this.worker.terminate();

    /*
     * Post a message and arbitrary payload to the worker,
     * tracking the requestId.
     */
    protected promiseMessage = <T extends BaseInboundMessagePartialPayload>(payload: T): Promise<any> => {
        return new Promise((resolve, reject) => {
            const requestId = generateId();
            this.reject = reject;
            this.promiseMap.set(requestId, { resolve, reject });
            this.worker.postMessage({ ...payload, requestId });
        });
    }

    /*
     * Handle a return response from the worker, auto-resolving the Promise
     * by a lookup to the requestId.
     */
    protected handleReturnPayload = (payload: WorkerReturnPayload): any => {
        const data = payload.data.result ? payload.data.result : {}
        const resolve = this.promiseMap.get(payload.data.requestId)!.resolve;
        this.promiseMap.delete(payload.data.requestId);
        return resolve(data);
    }

    /*
     * Return the body of a function as a string.
     */
    protected stripFunctionToContext = (f: () => any): string => {
        const funcString = `${f}`;
        return funcString
            .substring(0, funcString.lastIndexOf('}'))
            .substring(funcString.indexOf('{') + 1)
    }

    /*
     * Return an array of messageTypes as a series of JS variable declarations.
     */
    protected addMessageTypesToContext = (messageTypes: string[]): string => {
        return messageTypes.map((v: string) => `var ${v} = '${v}';`).join(' ');
    }
}