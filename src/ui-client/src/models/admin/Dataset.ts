import { PatientListDatasetShape } from "../patientList/Dataset";

/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface AdminDemographicsDatasetQuery {
    sql: string;
}

export interface AdminDatasetQuery {
    id: string;
    category?: string;
    description?: string;
    name: string;
    shape: PatientListDatasetShape;
    sql: string;
    universalId?: string;
}