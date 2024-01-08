/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import NoteSearchWebWorker, { SearchResult, RadixTreeResult } from '../providers/noteSearch/noteSearchWebWorker';
import { NoteDatasetContext } from '../models/cohort/NoteSearch';
import { NoteSearchTerm } from '../models/state/CohortState';

const engine = new NoteSearchWebWorker();

export const indexNotes = (datasets: NoteDatasetContext[]) => {
    return new Promise<void>( async (resolve, reject) => {
        await engine.index(datasets);
        resolve();
    });
};

export const searchPrefix = (prefix: string): Promise<RadixTreeResult> => {  
    return new Promise ( async (resolve, reject) => {
        const result = await engine.searchPrefix(prefix) as RadixTreeResult;  
        resolve(result)
    });
};  

export const flushNotes = () => {
    return new Promise<void>( async (resolve, reject) => {
        await engine.flush();
        resolve();
    });
};

export const searchNotes = (terms: NoteSearchTerm[]): Promise<SearchResult> => {
    return new Promise( async (resolve, reject) => {
        const results = await engine.search(terms) as SearchResult;
        resolve(results);
    });
};
