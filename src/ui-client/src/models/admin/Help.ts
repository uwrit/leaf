/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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

// rename to AdminHelpPageDTO
export interface AdminHelpContentDTO {
    title: string;
    category: string;
    content: ContentRow[];
}

// rename to AdminHelpPage
export interface AdminHelpContent extends AdminHelpContentDTO {}