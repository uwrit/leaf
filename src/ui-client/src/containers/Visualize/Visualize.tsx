/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux'
import AggregateDemographics from '../../components/Visualize/AggregateDemographics';
import RespondentDemographics from '../../components/Visualize/RespondentDemographics';
import { AppState, AuthorizationState } from '../../models/state/AppState';
import { CohortMap, CohortState, NetworkCohortState, CohortStateType } from '../../models/state/CohortState';
import { NetworkRespondentMap } from '../../models/NetworkRespondent';
import computeDimensions from '../../utils/computeDimensions';
import LoaderIcon from '../../components/Other/LoaderIcon/LoaderIcon';
import './Visualize.css';
import CohortTooLargeBox from '../../components/Other/CohortTooLargeBox/CohortTooLargeBox';

interface OwnProps { }
interface StateProps {
    auth: AuthorizationState;
    cohort: CohortState;
    respondents: NetworkRespondentMap;
}
interface DispatchProps {}
type Props = StateProps & OwnProps & DispatchProps;
interface State {
    width: number;
}

class Visualize extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
    }

    public updateDimensions = () => {
        const dimensions = computeDimensions();
        this.setState({ width: dimensions.contentWidth });
    }

    public componentWillMount() {
        this.updateDimensions();
    }

    public componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    public render() {
        let completedRespondents = 0;
        const c = 'visualize';
        const { cohort, respondents, auth } = this.props;
        const demogHeight = 400;
        const respPadding = 200;
        const data: any = [];
        cohort.networkCohorts.forEach((nc: NetworkCohortState) => {
            const r = respondents.get(nc.id)!;
            if (r.enabled && nc.visualization.state === CohortStateType.LOADED) {
                completedRespondents++;
                data.push({ cohort: nc, respondent: r });
            }
        });

        /*
         * If too many patients for caching, let user know.
         */
        if (data.length === 1 && cohort.count.value > auth.config!.cacheLimit) {
            return <CohortTooLargeBox cacheLimit={auth.config!.cacheLimit} />
        }
        /*
         * Show a loading spinner if no respondents have completed yet.
         */
        if (cohort.visualization.state === CohortStateType.IN_ERROR) {
            return (
                <div className={`${c}-error`}>
                <p>
                    An error occurred while loading patient visualizations. We are sorry for the inconvenience.
                </p>
            </div>
            );
        } 
        /*
         * Show a loading spinner if no respondents have completed yet.
         */
        if (completedRespondents === 0 || cohort.visualization.state !== CohortStateType.LOADED) {
            return (
                <div className={`${c}-loading`}>
                    <LoaderIcon size={100} />
                </div>
            );
        } 

        return  (
            <div className={`${c}-container`}>
                <AggregateDemographics 
                    cohort={cohort} 
                    height={demogHeight}
                    width={this.state.width}
                />
                {data.length > 1 &&
                <div className={`${c}-respondent-demographic-container`}>
                    {data.map((d: any, i: number) => {
                        return (
                            <RespondentDemographics 
                                cohort={d.cohort} 
                                height={demogHeight}
                                key={i} 
                                respondent={d.respondent} 
                                width={this.state.width - respPadding} 
                            />
                        )
                    })}
                </div>
                }
            </div>
        )
    }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
    return { 
        auth: state.auth,
        cohort: state.cohort,
        respondents: state.respondents
    };
};

const mapDispatchToProps = {};

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(Visualize)