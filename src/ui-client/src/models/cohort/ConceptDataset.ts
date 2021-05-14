/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EncounterId, PatientId } from "../patientList/Patient";
import { PatientListDatasetSchema } from "../patientList/Dataset";

/*
 * Actual object returned from server following dataset request.
 * [results] are a patientId-keyed array of arrays, and [schema]
 * are the fields returned from the DB.
 */
export interface ConceptDatasetDTO {
    results: ConceptDatasetResults;
    schema: PatientListDatasetSchema;
}

interface ConceptDatasetResults {
    [p: string]: ConceptDatasetRowDTO[];
}

export interface ConceptDatasetRowDTO {
    personId: PatientId;
    encounterId?: EncounterId;
    dateField?: string;
    numberField?: number;
}

export interface ConceptDatasetRow {
    personId: PatientId;
    encounterId?: EncounterId;
    numberField?: number;
    dateField: Date;
}