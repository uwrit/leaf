/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import CountUp from 'react-countup';
import { FiInfo } from 'react-icons/fi';
import { Dispatch } from 'redux';
import { connect } from 'react-redux'
import { setCohortCountBoxState } from '../../actions/generalUi';
import { AppState } from '../../models/state/AppState';
import { NetworkCohortState, PatientCountState } from '../../models/state/CohortState';
import { CohortCountBoxState } from '../../models/state/GeneralUiState'
import { NetworkIdentity } from '../../models/NetworkResponder';
import { Query } from '../../models/Query';
import './CohortSummary.css';

interface OwnProps {}
interface StateProps {
    cohortCountBox: CohortCountBoxState;
    count: PatientCountState;
    currentQuery: Query;
    networkCohorts: Map<number, NetworkCohortState>;
    responders: Map<number, NetworkIdentity>;
}
interface DispatchProps {
    setCohortCountBoxState: (boxVisible: boolean, boxMinimized: boolean, infoButtonVisible: boolean) => void;
}
type Props = StateProps & DispatchProps & OwnProps;

export class CohortSummary extends React.Component<Props> {
    private prevCount = 0;

    public shouldComponentUpdate(nextProps: Props) {
        // Check counts
        if (this.prevCount !== nextProps.count.value) { 
            return true; 
        }
        // Compare box display status (ie, is minimized, visible)
        if (!this.cohortCountBoxStatesAreSame(nextProps.cohortCountBox, this.props.cohortCountBox)) { 
            return true; 
        }
        // Check query name (if user is saving)
        if (nextProps.currentQuery.name !== this.props.currentQuery.name) {
            return true;
        }
        return false;
    }

    public componentDidUpdate(props: Props, state: any, count: number) {
        this.prevCount = count;
    }

    public getSnapshotBeforeUpdate(prevProps: Props): any {
        return this.props.count.value;
    }

    public cohortCountBoxStatesAreSame = (ccb1: CohortCountBoxState, ccb2: CohortCountBoxState) => {
        return (
            boolToString(ccb1.boxMinimized) + boolToString(ccb1.boxVisible) + boolToString(ccb1.infoButtonVisible) === 
            boolToString(ccb2.boxMinimized) + boolToString(ccb2.boxVisible) + boolToString(ccb2.infoButtonVisible)
        );
    }

    public toggleCohortCountBox = () => {
        const { cohortCountBox } = this.props;
        this.props.setCohortCountBoxState(cohortCountBox.boxVisible, !this.props.cohortCountBox.boxMinimized, cohortCountBox.infoButtonVisible);
    }

    public handleInfoBoxClick = () => {
        if (this.props.cohortCountBox.boxVisible) {
            this.props.setCohortCountBoxState(true, !this.props.cohortCountBox.boxMinimized, true);
            this.setCohortCountBoxFocus();
        }
    }

    public setCohortCountBoxFocus = () => {
        const countBox: any = document.getElementsByClassName('cohort-count-detail-container');
        if (countBox[0]) {
            countBox[0].focus();
        }
    }

    public formatNumber = (value: number) => { 
        return value.toLocaleString();
    }

    public render() {
        const { infoButtonVisible } = this.props.cohortCountBox;
        const { plusMinus, withinLowCellThreshold, value } = this.props.count;
        const infoBoxClasses = [ 'cohort-summary-info-box' ];
        const duration = value === 0 && this.prevCount > 0 ? 0.2 : 1.0;
        const displayName = this.props.currentQuery.name === '' ? 'Unsaved Query' : this.props.currentQuery.name;

        if (infoButtonVisible) { infoBoxClasses.push('show'); }

        return (
            <div className="cohort-summary-container">
                <div className="cohort-summary-name">
                    <span>{displayName}</span>
                </div>
                <div className="cohort-summary-count">
                    <CountUp className="cohort-summary-count-number" 
                        start={this.prevCount} 
                        end={value} 
                        duration={duration} 
                        decimals={0} 
                        formattingFn={this.formatNumber} 
                    />
                    {this.getTrailingText(plusMinus, withinLowCellThreshold)}
                </div>
                <div className={infoBoxClasses.join(' ')} onClick={this.handleInfoBoxClick}>
                    {infoButtonVisible && <FiInfo />}
                </div>
            </div>
        );
    }

    private getTrailingText = (plusMinus: number, withinLowCellThreshold: boolean) => {
        let text = ' patients';
        if (withinLowCellThreshold) { text = ' patients or less'; }
        else if (plusMinus > 0)     { text = ` +/- ${plusMinus} patients`; }

        return <span className="cohort-summary-count-patients">{text}</span>
    }
}

const boolToString = (val: boolean) => val ? '1' : '0';

const mapStateToProps = (state: AppState) => {
    return { 
        cohortCountBox: state.generalUi.cohortCountBox,
        count: state.cohort.count,
        currentQuery: state.queries.current,
        networkCohorts: state.cohort.networkCohorts,
        responders: state.responders
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
    (mapStateToProps, mapDispatchToProps)(CohortSummary);
