/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export interface HelpPages {
    id: number;
    categoryId: number;
    title: string;
}

// export interface HelpPagesDTO extends HelpPages {

// }

export interface HelpPageContent {
    id: number;
    pageId: number;
    orderId: number;
    type: string;
    textContent: string;
    imageContent: Uint16Array;
    imageId: string;
}

// export interface HelpPageContentDTO extends HelpPageContent {

// }

// export const HelpPagesDTO = (helpPages: HelpPages): HelpPagesDTO => {
//     return {
//         id: helpPages.id,
//         categoryId: helpPages.categoryId,
//         title: helpPages.title
//     }
// }

// export const HelpPageContentDTO = (helpPageContent: HelpPageContent): HelpPageContentDTO => {
//     return {
//         id: helpPageContent.id,
//         pageId: helpPageContent.pageId,
//         orderId: helpPageContent.orderId,
//         type: helpPageContent.type,
//         textContent: helpPageContent.textContent,
//         imageContent: helpPageContent.imageContent,
//         imageId: helpPageContent.imageId
//     }
// }