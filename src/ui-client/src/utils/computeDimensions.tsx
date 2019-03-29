/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

interface Dimensions {
    sidebarWidth: number;
    contentWidth: number;
    height: number;
}

export default function computeDimensions(): Dimensions {
    const dim: Dimensions = { sidebarWidth: 0, contentWidth: 0, height: 0 };
    const sidebar = document.getElementById('sidebar-container')!;
    const header = document.getElementById('header-container')!;

    dim.sidebarWidth = sidebar.getClientRects()[0].width;
    dim.height = window.innerHeight - header.getClientRects()[0].height;
    dim.contentWidth = window.innerWidth - dim.sidebarWidth;
    return dim;
}