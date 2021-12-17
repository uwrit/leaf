/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux'
import { Col, Container, Row } from 'reactstrap';
import { Direction, DirectionalSlider } from '../../components/Other/DirectionalSlider/DirectionalSlider';
import { AppState, AuthorizationState } from '../../models/state/AppState';
import { CohortStateType, TimelinesState } from '../../models/state/CohortState';
import ConceptColumnContainer from '../FindPatients/ConceptColumnContainer';
import TimelinesControlPanelStep from '../../components/Timelines/TimelinesControlPanelStep';
import { TimelinesDisplayMode } from '../../models/timelines/Configuration';
import AggregateTimelineChart from '../../components/Timelines/AggregateTimelineChart';
import PanelSelectorModal from '../../components/Modals/PanelSelectorModal/PanelSelectorModal';
import TimelinesConceptDragOverlay from '../../components/Timelines/TimelinesConceptDragOverlay';
import TimelinesDateRangeSelector from '../../components/Timelines/TimelinesDateRangeSelector'
import { getLatestTimelinesDataFromConfig, getPanelIndexDataset, setTimelinesConfiguration, setTimelinesIndexPanelId } from '../../actions/cohort/timelines';
import LoaderIcon from '../../components/Other/LoaderIcon/LoaderIcon';
import { FiCheck } from 'react-icons/fi';
import TimelinesChartTitle from '../../components/Timelines/TimelinesChartTitle';
import CheckboxSlider from '../../components/Other/CheckboxSlider/CheckboxSlider';
import './Timelines.css';

export enum TimelinesOverlayMode {
    WaitingForDrop = 1,
    ConfiguringConcept = 2,
    RequestingData = 3
}

interface OwnProps { }
interface StateProps {
    auth: AuthorizationState;
    patientCount: number;
    timelines: TimelinesState;
}
interface DispatchProps {
    dispatch: any;
}
type Props = StateProps & OwnProps & DispatchProps;
interface State {
    overlayMode: TimelinesOverlayMode,
    showConcepts: boolean;
    showPanelSelector: boolean;
}

class Timelines extends React.Component<Props, State> {
    private className = 'timelines'

    constructor(props: Props) {
        super(props);
        this.state = {
            overlayMode: TimelinesOverlayMode.WaitingForDrop,
            showConcepts: false,
            showPanelSelector: false
        }
    }

    public componentDidUpdate(prevProps: Props): any {
        const { overlayMode } = this.state;
        const { timelines } = this.props;

        if (overlayMode === TimelinesOverlayMode.RequestingData &&
            timelines.state !== CohortStateType.REQUESTING) {
            this.setState({ overlayMode: TimelinesOverlayMode.WaitingForDrop });
        }
    }

    public render() {
        const c = this.className;
        const { dispatch, auth, patientCount, timelines } = this.props;
        const { overlayMode, showPanelSelector, showConcepts } = this.state;
        const hasConcepts =  timelines.configuration.panels.size > 0;
        const config = timelines.configuration;

        return  (
            <div className={`${c}-container scrollable-offset-by-header ${showConcepts ? 'show-concepts' : ''}`}>

                {/* Concept slider from right */}
                <DirectionalSlider 
                    show={this.state.showConcepts}
                    from={Direction.Left}
                    overlay={true}
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
                <Container fluid={true} className={`${c}-main ${showConcepts ? 'overlayed' : ''}`}>
                    <Row>

                        {/* Control panel */}
                        <Col md={4} className={`${c}-control-panel-container`}>
                            <div className={`${c}-control-panel`}>

                                {/* Index event */}
                                <TimelinesControlPanelStep number={1}
                                    enabled={true}
                                    text={'Choose an index event'}
                                    subtext={<span>
                                                {'Index events serve as the '}<strong>starting point</strong>{' for a timeline. Events can be ' +
                                                 'chosen from the panels used to define the cohort. If a patient has more than one ' +
                                                 'event, the '}<strong>earliest</strong>{' is used'}
                                             </span>}
                                    subComponent={this.getIndexControlPanelComponent()}
                                />

                                {/* Add Concepts */}
                                <TimelinesControlPanelStep number={2}
                                    enabled={timelines.indexConceptState === CohortStateType.LOADED}
                                    text={'Drag Concepts over to view data'}
                                    subtext={<span>
                                        {'Concepts can be dropped anywhere to the right to add them to the chart'}
                                            </span>}
                                    subComponent={(
                                        <div>
                                            <span className="clickable" onClick={this.toggleShowConcepts.bind(null, true)}>
                                                + Add Concepts ({timelines.configuration.panels.size} selected)
                                            </span>
                                        </div>)}
                                />

                                {/* Date range bins */}
                                <TimelinesControlPanelStep number={3}
                                    enabled={hasConcepts}
                                    text={'Configure time spans'}
                                    subtext={(
                                        <span>
                                            Configure timeline date increments
                                        </span>)}
                                    subComponent={<TimelinesDateRangeSelector dispatch={dispatch} config={timelines.configuration} />}
                                />

                                {/* Additional Options */}
                                <TimelinesControlPanelStep number={4}
                                    enabled={hasConcepts}
                                    text={'Additional Options'}
                                    subComponent={
                                        <Row className={`${c}-additional-options`}>
                                            <Col md={8}>
                                                <div className={`${c}-additional-options-text`}> Count only first occurrence</div>
                                            </Col>
                                            <Col md={4}>
                                                <CheckboxSlider
                                                    checked={config.firstEventOnly} 
                                                    onClick={this.handleFirstEventOnlyClick} 
                                                />
                                            </Col>
                                        </Row>
                                    }
                                />
                            </div>
                        </Col>

                        {/* Chart */}
                        <Col md={8} className={`${c}-chart`}>

                            {/* Overlay */}
                            {showConcepts && 
                            <TimelinesConceptDragOverlay 
                                handleOverlayModeChange={this.handleOverlayModeChange}
                                handleShowConceptsChange={this.toggleShowConcepts}
                                dispatch={dispatch} mode={overlayMode} timelines={timelines}
                            />}

                            {/* Charts */}
                            {hasConcepts &&
                            <div>

                                {/* Header */}
                                <TimelinesChartTitle auth={auth} patientCount={patientCount} timelines={timelines} />
                                
                                {/* Aggregate chart */}
                                {timelines.configuration.mode === TimelinesDisplayMode.AGGREGATE && 
                                <AggregateTimelineChart auth={auth} dispatch={dispatch} patientCount={patientCount} timelines={timelines} />}

                            </div>}
                        </Col>

                    </Row>
                </Container>
            </div>
        );
    }

    private handleOverlayModeChange = (mode: TimelinesOverlayMode) => {
        this.setState({ overlayMode: mode });
    }

    private handleFirstEventOnlyClick = () => {
        const { dispatch, timelines } = this.props;
        const newConfig = Object.assign({}, timelines.configuration, { firstEventOnly: !timelines.configuration.firstEventOnly });
        dispatch(setTimelinesConfiguration(newConfig))
        dispatch(getLatestTimelinesDataFromConfig(newConfig));
    }

    private toggleShowConcepts = () => {
        const { overlayMode } = this.state;
        const showConcepts = !this.state.showConcepts;

        if (!showConcepts && [TimelinesOverlayMode.ConfiguringConcept, TimelinesOverlayMode.RequestingData].includes(overlayMode)) {
            return;
        }
        this.setState({ 
            showConcepts: showConcepts,
            showPanelSelector: false,
            overlayMode: TimelinesOverlayMode.WaitingForDrop
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


    private handlePanelSelect = (panelIndex?: number) => {
        const { dispatch } = this.props;
        if (typeof(panelIndex) !== 'undefined') {
            dispatch(setTimelinesIndexPanelId(panelIndex));
            dispatch(getPanelIndexDataset(panelIndex));
            this.setState({ showPanelSelector: false });
        }
    };

    private getIndexControlPanelComponent = () => {
        const { timelines } = this.props;
        const c = `${this.className}-index-control-panel`;

        if (timelines.indexConceptState === CohortStateType.REQUESTING) {
            return (
                <div className={`${c} ${c}-loading`}>
                    <LoaderIcon size={15} />
                    <span>Loading...</span>
                </div>
            );
        } else if (timelines.indexConceptState === CohortStateType.LOADED) {
            const idx = timelines.configuration.indexPanel!+1;
            return (
                <div className={`${c} ${c}-loaded`}>
                    <FiCheck/>
                    <span className="clickable" onClick={this.handleAddIndexEventClick}>Panel {idx} (click to change)</span>
                </div>
            );
        }
        return (
            <div className={`${c} ${c}-not-loaded`}>
                <span className="clickable" onClick={this.handleAddIndexEventClick}>+ Choose Index Event</span>
            </div>
        );
    }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
    return {
        auth: state.auth,
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