/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { CohortMap } from '../models/state/CohortState';
import { NetworkRespondentMap } from '../models/NetworkRespondent';
import CohortAggregatorWebWorker from '../providers/cohortAggregator/cohortAggregatorWebWorker';

const aggregator = new CohortAggregatorWebWorker();

export const aggregateStatistics = (cohorts: CohortMap, respondents: NetworkRespondentMap) => {
    return new Promise( async (resolve, reject) => {
        const agg = await aggregator.aggregateStatistics(cohorts, respondents);
        resolve(agg);
    });
};
