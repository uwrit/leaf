/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface AdminHelpPageDTO {
    id: string;
    categoryId: string;
    title: string;
}

export interface AdminHelpPageCategoryDTO {
    id: string;
    name: string;
}

export interface AdminHelpPageContentDTO {
    id: string;
    pageId: string;
    orderId: number;
    type: string;
    textContent: string;
    imageId: string;
    imageContent: string;
    imageSize: number;
}

export type categoryId = string;
export type AdminHelpCategoryMap = Map<categoryId, AdminHelpPageCategory>;

export interface AdminHelpPage extends AdminHelpPageDTO { }
export interface AdminHelpPageCategory extends AdminHelpPageCategoryDTO {
    categoryPages: AdminHelpPageDTO[];
}
export interface AdminHelpPageContent extends AdminHelpPageContentDTO { }

export interface AdminHelpPageAndContentDTO {
    title: AdminHelpPage;
    category: AdminHelpPageCategory;
    content: AdminHelpPageContent[];
}

export interface AdminHelpPageAndContent extends AdminHelpPageAndContentDTO {}

/////////////////
export interface ContentRow {
    id: string;
    pageId: string;
    orderId: number;
    type: string;
    textContent: string;
    imageId: string;
    imageContent: string;
    imageSize: number;
}

export interface AdminHelpContentDTO {
    title: string;
    category: string;
    content: ContentRow[];
}

export interface AdminHelpContent extends AdminHelpContentDTO {}