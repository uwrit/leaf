/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { CohortStateType } from '../../models/state/CohortState';
import { CohortMap, NetworkCohortState } from '../../models/state/CohortState';

interface CCQueryQuerySitesProps { 
    network: CohortMap;
}

export class CohortCountQuerySites extends React.PureComponent<CCQueryQuerySitesProps> {
    constructor(props: CCQueryQuerySitesProps) {
        super(props);
    }

    public render() {
        let totalSites: number = this.props.network.size;
        let completedSites: number = 0; 
        this.props.network
            .forEach((cs: NetworkCohortState) => { 
                if (cs.count.state === CohortStateType.NOT_LOADED) {
                    totalSites--;
                }
                else if (cs.count.state === CohortStateType.LOADED) {
                    completedSites += 1;
                }
            });

        return (
            <div className="cohort-count-detail-sites">
                <span className="cohort-count-detail-sites-complete">{completedSites} </span> 
                of 
                <span className="cohort-count-detail-sites-total"> {totalSites} </span>
                sites complete
            </div>
        );
    }
}
