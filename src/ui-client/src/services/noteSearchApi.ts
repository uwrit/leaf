/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import NoteSearchWebWorker from '../providers/noteSearch/noteSearchWebWorker';
import { Note } from '../models/cohort/NoteSearch';

const engine = new NoteSearchWebWorker();

export const ingestNotes = (notes: Note[]) => {
    return new Promise( async (resolve, reject) => {
        await engine.ingest(notes);
        resolve();
    });
};

export const flushNotes = (notes: Note[]) => {
    return new Promise( async (resolve, reject) => {
        await engine.flush();
        resolve();
    });
};

export const searchNotes = (terms: string[]) => {
    return new Promise( async (resolve, reject) => {
        const results = await engine.search(terms);
        resolve(results);
    });
};
