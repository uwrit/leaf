/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export const workerContext = `
    let persistedSearchEngineEntries: SearchEngineEntry[] = [];

    var handleWorkMessage = function (payload) {
        switch (payload.message) {
            case INITIALIZE_SEARCH_ENGINE:
                return initSearch(payload);
            case SEARCH_HELP_PAGES:
                return searchHelpPages(payload);
            default:
                return null;
        }
    };
`