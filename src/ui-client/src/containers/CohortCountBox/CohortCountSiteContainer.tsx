/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { CohortCountSiteDetail, SiteCountDetail } from '../../components/CohortCountBox/CohortCountSiteDetail';
import { CohortState, NetworkCohortState } from '../../models/state/CohortState';
import { NetworkIdentity } from '../../models/NetworkRespondent';

interface Props { 
    cohort: CohortState;
    networkRespondents: Map<number, NetworkIdentity>;
    show: boolean;
}

export class CohortCountSiteContainer extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const cohort = this.props.cohort;
        const siteData: any = []; 
        let max: number = 0;
        cohort.networkCohorts
            .forEach((nc: NetworkCohortState, i: number) => {
                const respondent: NetworkIdentity = this.props.networkRespondents.get(nc.id)!;
                if (respondent.enabled) {
                    const site = {
                        countResults: nc.count,
                        id: respondent
                    } as SiteCountDetail;
                    max = nc.count.value > max ? nc.count.value : max;
                    siteData.push(site);
                }
            });

        return (
            <div className="cohort-count-site-container">    
                {this.props.show && siteData.map((s: SiteCountDetail) => {
                    return <CohortCountSiteDetail data={s} max={max} key={s.id.id} />
                })}
            </div>
        );
    }
}
