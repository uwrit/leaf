/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux'
import { setCohortCountBoxState } from '../../actions/generalUi';
import { CohortCountQueryDetail } from '../../components/CohortCountBox/CohortCountQueryDetail';
import { AppState } from '../../models/state/AppState';
import { CohortStateType, NetworkCohortState } from '../../models/state/CohortState';
import { CohortState } from '../../models/state/CohortState'
import { CohortCountBoxState } from '../../models/state/GeneralUiState'
import { NetworkIdentity } from '../../models/NetworkResponder';
import { CohortCountSiteContainer } from './CohortCountSiteContainer';
import './CohortCountBox.css';

interface StateProps { 
    cohort: CohortState;
    networkResponders: Map<number, NetworkIdentity>;
    cohortCountBox: CohortCountBoxState;
}
interface DispatchProps {
    setCohortCountBoxState: (boxVisible: boolean, boxMinimized: boolean, infoButtonVisible: boolean) => void;
}
interface OwnProps {}
type Props = StateProps & DispatchProps & OwnProps;

interface State {
    showDetail: boolean;
}

class CohortCountBox extends React.PureComponent<Props, State> {
    private timeoutMs = 3000;
    private timeout: any;
    private clicked = false;
    private mouseOut = true;

    constructor(props: Props) {
        super(props);
        this.state = { 
            showDetail: props.networkResponders.size > 1
        };
    }

    public handleMouseEnter = () => this.mouseOut = false;

    public handleMouseLeave = () => this.mouseOut = true;

    public hideCountBoxOnTimeout = () => {
        const { cohort, cohortCountBox } = this.props;

        // If 3 seconds has elapsed since the cohort count query ended and
        // the box is still visible and the user has not reset the query definition, hide the box
        if (cohortCountBox.boxVisible && !cohortCountBox.boxMinimized && cohort.count.state === CohortStateType.LOADED) {
            const minimized = !this.clicked;
            this.props.setCohortCountBoxState(true, minimized, true);
            this.timeout = null;
        }
    }

    public componentDidUpdate () { return; }

    public getSnapshotBeforeUpdate (prevProps: Props) {
        const prevState = prevProps.cohort.count.state;
        const currState = this.props.cohort.count.state; 

        if (currState === CohortStateType.LOADED && prevState !== CohortStateType.LOADED) {
            this.timeout = setTimeout(
                () => this.hideCountBoxOnTimeout(),
                this.timeoutMs
            );    
            this.clicked = false;
        }
        else if (prevState === currState) {
            return null;
        }
        else if (currState === CohortStateType.REQUESTING) {
            this.props.setCohortCountBoxState(true, false, false);
        }
        else if (currState === CohortStateType.NOT_LOADED) {
            this.props.setCohortCountBoxState(false, false, false);
        }
        return null;
    }

    public handleShowDetailClick = () => {
        this.setState({ showDetail: !this.state.showDetail });
    }

    public handleBlur = () => {
        if (this.mouseOut && this.props.cohortCountBox.boxVisible && this.props.cohort.count.state !== CohortStateType.REQUESTING) {
            this.props.setCohortCountBoxState(true, true, true);
        }
    }

    public handleClick = () => {
        if (this.timeout) {
            this.clicked = true;
        }
    }

    public render() {
        const { cohort, cohortCountBox, networkResponders}  = this.props;
        const { showDetail } = this.state;
        const { boxMinimized, boxVisible } = cohortCountBox;

        const classes = [ 'cohort-count-detail-container' ];
        const cohorts: NetworkCohortState[] = [];

        cohort.networkCohorts.forEach((nc) => {
            const nr = networkResponders.get(nc.id)!;
            if (nr.enabled && !nr.isGateway) {
                cohorts.push(nc);
            }
        });
        
        if (boxVisible && !boxMinimized) { classes.push('show') };
        if (showDetail)                  { classes.push('show-detail') };

        return (
            <div 
                className={classes.join(' ')} 
                onBlur={this.handleBlur} 
                tabIndex={0} 
                onClick={this.handleClick}
                onMouseLeave={this.handleMouseLeave} 
                onMouseEnter={this.handleMouseEnter}>
 
                <CohortCountQueryDetail cohort={cohorts} state={cohort.count.state} />

                <div className='cohort-count-detail-show'>
                    <span className='link-span' onClick={this.handleShowDetailClick}>
                        {showDetail ? 'hide detail' : 'show detail'}
                    </span>
                </div>

                <CohortCountSiteContainer cohorts={cohorts} network={networkResponders!} show={showDetail} />

            </div>
        );
    }
}

const mapStateToProps = (state: AppState): StateProps => {
    return { 
        cohort: state.cohort,
        cohortCountBox: state.generalUi.cohortCountBox,
        networkResponders: state.responders
    };
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) : DispatchProps => {
    return { 
        setCohortCountBoxState: (boxVisible: boolean, boxMinimized: boolean, infoButtonVisible: boolean) => {
            dispatch(setCohortCountBoxState(boxVisible, boxMinimized, infoButtonVisible))
        }
    };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(CohortCountBox);