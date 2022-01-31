/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { HelpPageLoadState } from '../state/HelpState';

export interface PartialHelpPageDTO {
    id: string;
    categoryId: string;
    title: string;
}

export interface HelpPageCategoryDTO {
    id: string;
    name: string;
}

export interface HelpPageContentDTO {
    id: string;
    orderId: number;
    type: string;
    textContent: string;
    imageId: string;
    imageContent: string;
    imageSize: number;
}

export interface HelpPage {
    id: string;
    title: string;
    category: HelpPageCategory;
    content: HelpPageContent[];
    contentState: HelpPageLoadState;
}

export type categoryId = string;
export type HelpCategoryMap = Map<categoryId, HelpCategoryPageCache>;
export interface PartialHelpPage extends PartialHelpPageDTO { }
export interface HelpPageCategory extends HelpPageCategoryDTO {}
export interface HelpCategoryPageCache extends HelpPageCategory {
    partialPages: PartialHelpPage[];
}
export interface HelpPageContent extends HelpPageContentDTO { }