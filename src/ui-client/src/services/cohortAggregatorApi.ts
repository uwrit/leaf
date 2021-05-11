/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { CohortMap } from '../models/state/CohortState';
import { NetworkResponderMap } from '../models/NetworkResponder';
import CohortAggregatorWebWorker from '../providers/cohortAggregator/cohortAggregatorWebWorker';
import { PatientListDatasetDTO } from '../models/patientList/Dataset';

const aggregator = new CohortAggregatorWebWorker();

export const aggregateStatistics = (cohorts: CohortMap, responders: NetworkResponderMap) => {
    return new Promise( async (resolve, reject) => {
        const agg = await aggregator.aggregateStatistics(cohorts, responders);
        resolve(agg);
    });
};

export const combineDatasets = (data: Map<string, PatientListDatasetDTO[]>): Promise<Map<string, any[]>> => {
    return new Promise( async (resolve, reject) => {
        const combined = await combineDatasets(data);
        resolve(combined);
    });
};
