/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { NetworkIdentity } from "../NetworkResponder";
import { PatientListDatasetDTO, PatientListDatasetQuery } from "../patientList/Dataset";


export interface NoteDTO {
    responderId: number;
    date: string | Date;
    datasetId: string;
    id: string;
    personId: string;
    text: string;
    type: string;
}

export interface Note extends NoteDTO {}

export interface NoteDatasetContext {
    dataset: PatientListDatasetDTO;
    query: PatientListDatasetQuery;
    responder: NetworkIdentity;
}