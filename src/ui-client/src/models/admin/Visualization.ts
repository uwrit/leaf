/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Constraint } from "./Concept";

export interface AdminVisualizationPageDTO {
    id: string;
    pageName: string;
    pageDescription: string;
    orderId: number;
    components: AdminVisualizationComponentDTO[];
    constraints: Constraint[];
    created: Date;
    createdBy: string;
    updated: Date;
    updatedBy: string;
}

export interface AdminVisualizationPage extends AdminVisualizationPageDTO {
    components: AdminVisualizationComponent[];
    unsaved?: boolean;
}

export interface AdminVisualizationComponentDTO {
    id: string;
    header: string;
    subHeader: string;
    jsonSpec: string;
    datasetQueryIds: string[];
    isFullWidth: boolean;
    orderId: number;
}

export interface AdminVisualizationComponent extends AdminVisualizationComponentDTO {}