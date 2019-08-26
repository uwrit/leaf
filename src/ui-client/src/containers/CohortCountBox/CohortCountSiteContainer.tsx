/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { CohortCountSiteDetail, SiteCountDetail } from '../../components/CohortCountBox/CohortCountSiteDetail';
import { NetworkCohortState } from '../../models/state/CohortState';
import { NetworkIdentity } from '../../models/NetworkResponder';

interface Props { 
    cohorts: NetworkCohortState[];
    network: Map<number,NetworkIdentity>;
    show: boolean;
}

export class CohortCountSiteContainer extends React.PureComponent<Props> {
    public render() {
        const { cohorts, network, show } = this.props;
        const sites: any = []; 
        let max: number = 0;

        cohorts.forEach((nc: NetworkCohortState) => {
            const responder = network.get(nc.id)!;
            if (responder.enabled) {
                const site = { countResults: nc.count, id: responder } as SiteCountDetail;
                max = nc.count.value > max ? nc.count.value : max;
                sites.push(site);
            }
        });

        return (
            <div className={`cohort-count-site-container`}>    
                {show && sites.map((s: SiteCountDetail) => {
                    return <CohortCountSiteDetail data={s} max={max} key={s.id.id}/>
                })}
            </div>
        );
    }
}
