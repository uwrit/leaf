/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export interface HelpPageCategoryDTO {
    id: number;
    category: string;
}

export interface HelpPageDTO {
    id: number;
    categoryId: number;
    title: string;
}

export interface HelpPageContentDTO {
    id: number;
    pageId: number;
    orderId: number;
    type: string;
    textContent: string;
    imageContent: Uint16Array;
    imageId: string;
}

export type categoryId = number;
export type HelpCategoryMap = Map<categoryId, HelpPageCategory>;

export interface HelpPageCategory extends HelpPageCategoryDTO {
    categoryPages: HelpPageDTO[];
}

export interface HelpPage extends HelpPageDTO { }
export interface HelpPageContent extends HelpPageContentDTO { }