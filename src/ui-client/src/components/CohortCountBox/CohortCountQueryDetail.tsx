/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { NetworkCohortState, CohortStateType } from '../../models/state/CohortState';
import { CohortCountQuerySites } from './CohortCountQuerySites';
import { CohortCountQueryTimer } from './CohortCountQueryTimer';

interface Props { 
    cohort: NetworkCohortState[];
    state: CohortStateType
}

export class CohortCountQueryDetail extends React.PureComponent<Props> {
    public render() {
        const { cohort, state } = this.props;

        return (
            <div>
                <CohortCountQuerySites cohorts={cohort} />
                <CohortCountQueryTimer countState={state} />
            </div>
        );
    }
}
