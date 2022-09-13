/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux'
import AggregateDemographics from '../../components/Visualize/AggregateDemographics';
import ResponderDemographics from '../../components/Visualize/ResponderDemographics';
import { AppState, AuthorizationState } from '../../models/state/AppState';
import { CohortState, NetworkCohortState, CohortStateType } from '../../models/state/CohortState';
import { NetworkResponderMap } from '../../models/NetworkResponder';
import computeDimensions from '../../utils/computeDimensions';
import LoaderIcon from '../../components/Other/LoaderIcon/LoaderIcon';
import CohortTooLargeBox from '../../components/Other/CohortTooLargeBox/CohortTooLargeBox';
import './Visualize.css';

interface OwnProps { }
interface StateProps {
    auth: AuthorizationState;
    cohort: CohortState;
    responders: NetworkResponderMap;
}
interface DispatchProps {}
type Props = StateProps & OwnProps & DispatchProps;
interface State {
    width: number;
}

interface ErrorBoundaryState {
    errored: boolean;
}

class VisualizeErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
    constructor(props: Props) {
        super(props);
        this.state = { 
            errored: false
        };
    }

    public static getDerivedStateFromError(error: any) {
        return { errored: true };
    }
    
    public componentDidCatch(error: any, errorInfo: any) {    
        console.log(error, errorInfo);
    }

    public render() {
        if (this.state.errored) {
            return (
                <div className={`visualize-error`}>
                    <p>
                        Whoops! An error occurred while creating patient visualizations. We are sorry for the inconvenience. 
                        Please contact your Leaf administrator if this error continues.
                    </p>
                </div>
            );
        }

        return <Visualize {...this.props} />;
    }
}

class Visualize extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { 
            width: 1000
        };
    }

    public updateDimensions = () => {
        const dimensions = computeDimensions();
        this.setState({ width: dimensions.contentWidth });
    }

    public componentWillMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    public render() {
        let completedResponders = 0;
        const c = 'visualize';
        const { cohort, responders, auth } = this.props;
        const demogHeight = 400;
        const respPadding = 200;
        const data: any = [];
        const { cacheLimit } = auth.config!.cohort;
        cohort.networkCohorts.forEach((nc: NetworkCohortState) => {
            const r = responders.get(nc.id)!;
            if (r.enabled && nc.visualization.state === CohortStateType.LOADED) {
                completedResponders++;
                data.push({ cohort: nc, responder: r });
            }
        });

        /**
         * If too many patients for caching, let user know.
         */
        if (cohort.networkCohorts.size === 1 && cohort.count.value > cacheLimit) {
            return <CohortTooLargeBox cacheLimit={cacheLimit} />
        }

<<<<<<< HEAD
        /**
         * Block visualize when under lowcellmasking threshold
         */
         if (cohort.networkCohorts.size === 1 && cohort.count.value <= auth.config.cohort.lowCellMaskingThreshold) {
            return (
                <div className={`${c}-error`}>
                    <p>
                    Sorry, your administrator has configured Leaf to not show visualizations for cohorts of {auth.config.cohort.lowCellMaskingThreshold} patients or less.
                    </p>
                </div>
            );
        } 

=======
>>>>>>> dashboard-v2
        /**
         * Show a loading spinner if no responders have completed yet.
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
            <div className={`${c}-container scrollable-offset-by-header`}>
                <AggregateDemographics 
                    cohort={cohort} 
                    height={demogHeight}
                    width={this.state.width}
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
        responders: state.responders
    };
};

const mapDispatchToProps = {};

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(VisualizeErrorBoundary)