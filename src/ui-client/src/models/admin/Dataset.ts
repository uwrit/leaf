/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PatientListDatasetShape } from "../patientList/Dataset";
import { Constraint } from "./Concept";

export interface DatasetQueryConstraint extends Constraint {
    datasetQueryId: string;
}

export interface AdminDemographicQuery {
    sqlStatement: string;
    lastChanged: string;
    changedBy: string;
}

export interface AdminDatasetQuery {
    id: string;
    categoryId?: number;
    constraints: DatasetQueryConstraint[];
    description?: string;
    name: string;
    shape: PatientListDatasetShape;
    sqlStatement: string;
    tags: string[];
    universalId?: string;
    unsaved?: boolean;
    changed?: boolean;
}

export interface DatasetQueryCategory {
    id: number;
    category: string;
    changed?: boolean;
    unsaved?: boolean;
}