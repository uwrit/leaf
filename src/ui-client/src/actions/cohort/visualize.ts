/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { DemographicStatistics } from '../../models/cohort/DemographicDTO';

// Cohort visualize actions
export const VISUALIZATION_REQUEST = 'REQUEST_VISUALIZATION_DATA';
export const VISUALIZATION_SET_NETWORK = 'VISUALIZATION_SET_NETWORK';
export const VISUALIZATION_SET_AGGREGATE = 'VISUALIZATION_SET_AGGREGATE';

export interface CohortVisualizationAction {
    id: number;
    vizResults?: DemographicStatistics;
    error?: string;
    type: string;
}

// Asynchonous
// export const getVisualizationData = ()

// Synchronous
export const setNetworkVisualizationData = (id: number, vizResults: DemographicStatistics): CohortVisualizationAction => {
    return {
        id,
        type: VISUALIZATION_SET_NETWORK,
        vizResults
    };
};

export const setAggregateVisualizationData = (vizResults: DemographicStatistics): CohortVisualizationAction => {
    return {
        id: 0,
        type: VISUALIZATION_SET_AGGREGATE,
        vizResults
    };
};
