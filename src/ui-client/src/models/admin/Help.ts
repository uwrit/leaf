/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AdminHelpPageLoadState } from '../state/AdminState';

export interface PartialAdminHelpPageDTO {
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
    orderId: number;
    type: string;
    textContent: string;
    imageId: string;
    imageContent: string;
    imageSize: number;
}

export interface AdminHelpPageDTO {
    id: string;
    title: string;
    category: AdminHelpPageCategory;
    content: AdminHelpPageContent[];
}

export interface AdminHelpPage extends AdminHelpPageDTO {
    contentState: AdminHelpPageLoadState;
}
export type categoryId = string;
export type AdminHelpCategoryMap = Map<categoryId, AdminHelpCategoryPageCache>;
export interface PartialAdminHelpPage extends PartialAdminHelpPageDTO { }
export interface AdminHelpPageCategory extends AdminHelpPageCategoryDTO {}
export interface AdminHelpCategoryPageCache extends AdminHelpPageCategory {
    partialPages: PartialAdminHelpPage[];
}
export interface AdminHelpPageContent extends AdminHelpPageContentDTO { }