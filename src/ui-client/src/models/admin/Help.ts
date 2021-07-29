/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface CreateHelpPageDTO {
    title: string;
    category: string;
    orderId: number;
    type: string;
    textContent: string;
    imageContent: string;
    imageId: string;
}

export interface UpdateHelpPageContentDTO extends CreateHelpPageDTO {
    pageId: number;
}

export interface CreateHelpPage extends CreateHelpPageDTO {}
export interface UpdateHelpPageContent extends UpdateHelpPageContentDTO {}




export interface ContentRow {
    pageId: number;
    orderId: number;
    type: string;
    textContent: string;
    imageContent: string;
    imageId: string;
}

export interface AdminHelpContentDTO {
    title: string;
    category: string;
    content: ContentRow[];
}

export interface AdminHelpContent extends AdminHelpContentDTO {}