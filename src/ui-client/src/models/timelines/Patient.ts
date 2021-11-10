/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ConceptDatasetRow } from "../cohort/ConceptDataset";
import { Panel } from "../panel/Panel";
import { PatientId } from "../patientList/Patient";

// Concept model stored in web worker 
export interface ConceptDatasetStore {
    panel: Panel;
    patients: Map<PatientId, Patient>;
}

// Index dataset model stored in web worker 
export interface IndexDatasetStore {
    patients: Map<PatientId, IndexPatient>;
}

// Concept Patient model stored in web worker
export interface Patient {
    compoundId: PatientId;
    id: string;
    responderId: number;
    rows: ConceptDatasetRow[];
}

// Index Patient model stored in web worker
export interface IndexPatient extends Patient {
    initialDate?: Date;
    finalDate?: Date;
}