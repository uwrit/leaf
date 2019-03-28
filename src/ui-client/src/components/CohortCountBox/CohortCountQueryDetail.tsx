/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { CohortState } from '../../models/state/CohortState';
import { CohortCountQuerySites } from './CohortCountQuerySites';
import { CohortCountQueryTimer } from './CohortCountQueryTimer';

interface Props { 
    cohort: CohortState;
}

export class CohortCountQueryDetail extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        return (
            <div>
                <CohortCountQuerySites network={this.props.cohort.networkCohorts} />
                <CohortCountQueryTimer countState={this.props.cohort.count.state} />
            </div>
        );
    }
}
