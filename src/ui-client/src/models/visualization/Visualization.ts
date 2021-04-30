/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export interface VisualizationPageDTO {
    id: string;
    pageName: string;
    pageDescription: string;
    orderId: number;
    components: VisualizationComponentDTO[];
}

export interface VisualizationPage extends VisualizationPageDTO {
    components: VisualizationComponent[];
}

export interface VisualizationComponentDTO {
    id: string;
    header: string;
    subHeader: string;
    jsonSpec: string;
    datasetQueryIds: string[];
    isFullWidth: boolean;
    orderId: number;
}

export interface VisualizationComponent extends VisualizationComponentDTO {}