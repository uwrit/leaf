/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import NoteSearchWebWorker from '../providers/noteSearch/noteSearchWebWorker2';
import { Note } from '../models/cohort/NoteSearch';
import { NoteSearchResult } from '../models/state/CohortState';

const engine = new NoteSearchWebWorker();
//const engine = new MiniSearch({ fields: ['text', 'type'], storeFields: ['text', 'type'] });

export const indexNotes = (notes: Note[]) => {
    return new Promise<void>( async (resolve, reject) => {
        await engine.index(notes);
        resolve();
    });
};

export const flushNotes = () => {
    return new Promise<void>( async (resolve, reject) => {
        //await engine.flush();
        resolve();
    });
};

export const searchNotes = (terms: string[]): Promise<any> => {
    return new Promise( async (resolve, reject) => {
        const results = await engine.search(terms);
        //console.log(results);
        //const results = await engine.search(terms) as SearchResult;
        resolve(null);
    });
};
