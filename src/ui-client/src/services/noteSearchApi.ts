/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import NoteSearchWebWorker, { DocumentSearchResult, NoteSearchResult, RadixTreeResult } from '../providers/noteSearch/noteSearchWebWorker';
import { NoteDatasetContext } from '../models/cohort/NoteSearch';
import { NoteSearchConfiguration, NoteSearchTerm } from '../models/state/CohortState';
import { PatientListDatasetQuery } from '../models/patientList/Dataset';

const engine = new NoteSearchWebWorker();

export const getHighlightedNoteFromResults = (note: DocumentSearchResult): Promise<DocumentSearchResult> => {
    return new Promise( async (resolve, reject) => {
        const results = await engine.getHighlightedNote(note) as DocumentSearchResult;
        resolve(results);
    });
};

export const indexNotes = (config: NoteSearchConfiguration, datasets: NoteDatasetContext[], terms: NoteSearchTerm[]): Promise<NoteSearchResult> => {
    return new Promise( async (resolve, reject) => {
        const results = await engine.index(config, datasets, terms) as NoteSearchResult;
        resolve(results);
    });
};

export const removeDataset = (config: NoteSearchConfiguration, dataset: PatientListDatasetQuery, terms: NoteSearchTerm[]): Promise<NoteSearchResult> => {
    return new Promise( async (resolve, reject) => {
        const results = await engine.removeDataset(config, dataset, terms) as NoteSearchResult;
        resolve(results);
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

export const searchNotes = (config: NoteSearchConfiguration, terms: NoteSearchTerm[]): Promise<NoteSearchResult> => {
    return new Promise( async (resolve, reject) => {
        const results = await engine.search(config, terms) as NoteSearchResult;
        resolve(results);
    });
};
