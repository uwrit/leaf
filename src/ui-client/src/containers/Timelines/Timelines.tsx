/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux'
import { Col, Container, Row } from 'reactstrap';
import { Direction, DirectionalSlider } from '../../components/Other/DirectionalSlider/DirectionalSlider';
import { AppState } from '../../models/state/AppState';
import { TimelinesState } from '../../models/state/CohortState';
import ConceptColumnContainer from '../FindPatients/ConceptColumnContainer';
import TimelinesControlPanelStep from '../../components/Timelines/TimelinesControlPanelStep';
import { TimelinesDisplayMode } from '../../models/timelines/Configuration';
import AggregateTimelineChart from '../../components/Timelines/AggregateTimelineChart';
import PanelSelectorModal from '../../components/Modals/PanelSelectorModal/PanelSelectorModal';
import TimelinesConceptDragOverlay from '../../components/Timelines/TimelinesConceptDragOverlay';
import TimelinesDateRangeSelector from '../../components/Timelines/TimelinesDateRangeSelector'
import { getPanelIndexDataset } from '../../actions/cohort/timelines';
import './Timelines.css';

interface OwnProps { }
interface StateProps {
    patientCount: number;
    timelines: TimelinesState;
}
interface DispatchProps {
    dispatch: any;
}
type Props = StateProps & OwnProps & DispatchProps;
interface State {
    showConcepts: boolean;
    showPanelSelector: boolean;
}

class Timelines extends React.Component<Props, State> {
    private className = 'timelines'

    constructor(props: Props) {
        super(props);
        this.state = {
            showConcepts: false,
            showPanelSelector: false
        }
    }

    public render() {
        const c = this.className;
        const { dispatch, timelines } = this.props;
        const { showPanelSelector, showConcepts } = this.state;

        return  (
            <div className={`${c}-container scrollable-offset-by-header ${showConcepts ? 'show-concepts' : ''}`}>

                {/* Concept slider from right */}
                <DirectionalSlider 
                    show={this.state.showConcepts}
                    from={Direction.Left}
                    overlay={false}
                    toggle={this.toggleShowConcepts}>
                    <div>
                        <ConceptColumnContainer />
                    </div>
                </DirectionalSlider>

                {/* Panel Selector */}
                {showPanelSelector &&
                <PanelSelectorModal
                    headerText={'Which event should be the index event?'} 
                    handleByPanelSelect={this.handlePanelSelect}
                    toggle={this.toggleShowPanelSelector}
                />
                }

                {/* Main content */}
                <Container fluid={true} className={`${c}-main`}>
                    <Row>

                        {/* Control panel */}
                        <Col md={3}>
                            <div className={`${c}-control-panel`}>
                                <TimelinesControlPanelStep number={1} clickable={true}
                                    text={'Choose an index event'} handleClick={this.handleAddIndexEventClick}
                                    subtext={<span>
                                                {'Index events serve as the '}<strong>starting point</strong>{' for a timeline. Events can be ' +
                                                 'chosen from the panels used to define the cohort. If a patient has more than one ' +
                                                 'event, the '}<strong>earliest</strong>{' is used'}
                                             </span>}
                                />
                                <TimelinesControlPanelStep number={2} clickable={true}
                                    text={'Drag Concepts over to view data'} handleClick={this.handleAddDataClick}
                                    subtext={<span>
                                        {'Concepts can be dropped anywhere to the right to add them to the chart'}
                                     </span>}
                                />
                                <TimelinesControlPanelStep number={3} clickable={false}
                                    text={'Configure time spans'} handleClick={this.doNothing}
                                    subtext={<span>
                                        {'Set the range of dates to see timelines for'}
                                     </span>}
                                    subComponent={<TimelinesDateRangeSelector dispatch={dispatch} config={timelines.configuration} />}
                                />
                            </div>
                        </Col>

                        {/* Chart */}
                        <Col md={9}>
                            <div className={`${c}-chart`}>

                                {/* Overlay */}
                                {showConcepts && 
                                <TimelinesConceptDragOverlay dispatch={dispatch} toggleOverlay={this.toggleShowConcepts}/>}

                                {/* Aggregate chart */}
                                {timelines.configuration.mode === TimelinesDisplayMode.AGGREGATE && 
                                <AggregateTimelineChart data={timelines} />}

                            </div>
                        </Col>

                    </Row>
                </Container>
            </div>
        );
    }

    private doNothing = () => null;

    private toggleShowConcepts = () => {
        this.setState({ 
            showConcepts: !this.state.showConcepts,
            showPanelSelector: false 
        });
    };

    private toggleShowPanelSelector = () => {
        this.setState({ 
            showPanelSelector: !this.state.showPanelSelector,
            showConcepts: false
        });
    };

    private handleAddIndexEventClick = () => {
        this.toggleShowPanelSelector();
    };

    private handleAddDataClick = () => {
        this.toggleShowConcepts();
    };

    private handlePanelSelect = (panelIndex?: number) => {
        const { dispatch } = this.props;
        if (typeof(panelIndex) !== 'undefined') {
            dispatch(getPanelIndexDataset(panelIndex));
            this.setState({ showPanelSelector: false });
        }
    };
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
    return {
        patientCount: state.cohort.count.value,
        timelines: state.cohort.timelines
    };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        dispatch
    }
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(Timelines)