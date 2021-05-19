/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import AggregateDemographics from './AggregateDemographics';
import ResponderDemographics from './ResponderDemographics';
import { AuthorizationState } from '../../../models/state/AppState';
import { CohortState, NetworkCohortState, CohortStateType } from '../../../models/state/CohortState';
import { NetworkResponderMap } from '../../../models/NetworkResponder';
import LoaderIcon from '../../../components/Other/LoaderIcon/LoaderIcon';

interface Props {
    auth: AuthorizationState;
    cohort: CohortState;
    responders: NetworkResponderMap;
    width: number;
}

export class BasicDemographicsVisualization extends React.Component<Props> {
    private className = 'visualize';

    public render() {
        let completedResponders = 0;
        const c = this.className;
        const { cohort, responders, auth, width } = this.props;
        const demogHeight = 400;
        const respPadding = 200;
        const data: any = [];
        cohort.networkCohorts.forEach((nc: NetworkCohortState) => {
            const r = responders.get(nc.id)!;
            if (r.enabled && nc.visualization.state === CohortStateType.LOADED) {
                completedResponders++;
                data.push({ cohort: nc, responder: r });
            }
        });

        /**
         * Show generic error if any failed
         */
        if (cohort.visualization.state === CohortStateType.IN_ERROR) {
            return (
                <div className={`${c}-error`}>
                    <p>
                        Whoops! An error occurred while loading patient visualizations. We are sorry for the inconvenience. 
                        Please contact your Leaf administrator if this error continues.
                    </p>
                </div>
            );
        } 

        /**
         * Show a loading spinner if no responders have completed yet.
         */
        if (completedResponders === 0 || cohort.visualization.state !== CohortStateType.LOADED) {
            return (
                <div className={`${c}-loading`}>
                    <LoaderIcon size={100} />
                </div>
            );
        } 

        return  (
            <div className={`${c}-basic-demographics-container scrollable-offset-by-header`}>
                <AggregateDemographics 
                    cohort={cohort} 
                    height={demogHeight}
                    width={width}
                />
                {data.length > 1 && auth.config!.client.visualize.showFederated &&
                <div className={`${c}-responder-demographic-container`}>
                    {data.map((d: any, i: number) => {
                        return (
                            <ResponderDemographics 
                                cohort={d.cohort} 
                                height={demogHeight}
                                key={i} 
                                responder={d.responder} 
                                width={width - respPadding} 
                            />
                        )
                    })}
                </div>
                }
            </div>
        )
    }
}