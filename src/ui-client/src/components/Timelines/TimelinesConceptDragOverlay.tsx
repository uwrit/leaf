/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConnectDragPreview, ConnectDragSource, ConnectDropTarget, DropTarget, DropTargetConnector, DropTargetMonitor } from 'react-dnd';
import { Button, Col, Modal, ModalBody, ModalFooter, Row } from 'reactstrap';
import { getConceptDataset } from '../../actions/cohort/timelines';
import { TimelinesOverlayMode } from '../../containers/Timelines/Timelines';
import { Concept, ConceptSpecialization, ConceptSpecializationGroup } from '../../models/concept/Concept';
import { DateBoundary } from '../../models/panel/Date';
import { NumericFilter } from '../../models/panel/NumericFilter';
import { Panel as PanelModel } from '../../models/panel/Panel';
import { PanelItem } from '../../models/panel/PanelItem';
import { SubPanel, SubPanelJoinSequence } from '../../models/panel/SubPanel';
import { CohortStateType, TimelinesState } from '../../models/state/CohortState';
import { generateDummyPanel } from '../../reducers/admin/concept';
import Panel from '../FindPatients/Panels/Panel';
import LoaderIcon from '../Other/LoaderIcon/LoaderIcon';
import './TimelinesConceptDragOverlay.css';

interface DndProps {
    canDrop?: boolean;
    connectDragSource?: ConnectDragSource;
    connectDragPreview?: ConnectDragPreview;
    connectDropTarget?: ConnectDropTarget;
    isDragging?: boolean;
    isDropped?: boolean;
    isOver?: boolean;
}

interface OwnProps {
    dispatch: any;
    handleOverlayModeChange: (mode: TimelinesOverlayMode) => any;
    handleShowConceptsChange: () => any;
    mode: TimelinesOverlayMode;
    timelines: TimelinesState;
}

type Props = DndProps & OwnProps

interface State {
    hovered: HoverDropType;
    panel?: PanelModel
}

enum HoverDropType {
    All = 1,
    Specific = 2
}

const closeX = 
    <svg viewBox='0 0 24 24'>
        <path d='M13.414 12l5.793-5.793c.39-.39.39-1.023 0-1.414s-1.023-.39-1.414 0L12 10.586 6.207 4.793c-.39-.39-1.023-.39-1.414 0s-.39 1.023 0 1.414L10.586 12l-5.793 5.793c-.39.39-.39 1.023 0 1.414.195.195.45.293.707.293s.512-.098.707-.293L12 13.414l5.793 5.793c.195.195.45.293.707.293s.512-.098.707-.293c.39-.39.39-1.023 0-1.414L13.414 12z'></path>
    </svg>;

/**
 * Dnd handlers
 */
let conceptDropFunc = (concept: Concept) => {};
const conceptNodeTarget = {
    drop(props: Props, monitor: DropTargetMonitor, component: any) {
        const { dispatch, timelines } = props;
        const concept: Concept = monitor.getItem();
        const loadingConcept = timelines.state === CohortStateType.REQUESTING;

        if (loadingConcept || timelines.configuration.panels.get(concept.id)) {
            return;
        }
        conceptDropFunc(concept);
    },
    canDrop(props: Props, monitor: DropTargetMonitor) {
        const con = (monitor.getItem() as Concept);
        return !con.isExtension && con.isEncounterBased;
    }
}

const collectDrop = (connect: DropTargetConnector, monitor: DropTargetMonitor) => {
    return ({
        canDrop: monitor.canDrop(),
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    });
};

/**
 * Overlay component
 */
class TimelinesConceptDragOverlay extends React.PureComponent<Props, State> {
    private className = 'timelines-concept-drag-overlay';

    public constructor(props: Props) {
        super(props);
        conceptDropFunc = this.handleConceptDrop;
        this.state = {
            hovered: HoverDropType.All
        }
    }

    public render() {
        const c = this.className;
        const { hovered, panel } = this.state;
        const { connectDropTarget, canDrop, isOver, mode, timelines } = this.props;
        const panelHandlers = this.packageHandlers();

        return (
            <div className={`${c} ${canDrop && isOver ? 'can-drop' : ''}`}>

                {/* User picking Concepts */}
                {mode === TimelinesOverlayMode.WaitingForDrop &&
                connectDropTarget &&
                connectDropTarget(
                <div className={`${c}-inner waiting`}>
                    <Row>
                        <Col sm={12} className={`${c}-title-text`}>Drag and Drop Concepts for</Col>
                        <Col sm={6} className={`${c}-all-data ${hovered == HoverDropType.All ? 'hovered' : ''}`} 
                            onDragOver={this.toggleUseAllData.bind(null, HoverDropType.All)}>
                            <div>
                                All Data
                            </div>
                        </Col>
                        <Col sm={6} className={`${c}-specific-data ${hovered == HoverDropType.Specific ? 'hovered' : ''}`} 
                            onDragOver={this.toggleUseAllData.bind(null, HoverDropType.Specific)}>
                            <div>
                                Specific Dates or Values
                            </div>
                        </Col>
                    </Row>
                </div>)}

                {mode === TimelinesOverlayMode.ConfiguringConcept && panel &&
                <div className={`${c}-inner selecting`}>
                    <div className={`${c}-panel-selection-container`}>
                        <Panel panel={panel} isFirst={true} queryState={CohortStateType.LOADED} maybeHandlers={panelHandlers}/>
                        <div className={`${c}-panel-selection-explanation`}>
                            <span>Specify any date, numeric, or other filters, then click</span>
                            <span className={`${c}-panel-selection-emphasis`}>Add to Timeline</span>
                            <span>below</span>
                        </div>
                        <div className={`${c}-panel-selection-footer`}>
                            <Button className='leaf-button leaf-button-secondary' onClick={this.handlePanelCancelClick}>Cancel</Button>
                            <Button className='leaf-button leaf-button-primary' onClick={this.handlePanelGetDataClick}>Add to Timeline</Button>
                        </div>
                    </div>
                </div>}

                {/* Concept requested */}
                {mode === TimelinesOverlayMode.RequestingData &&
                <div className={`${c}-inner update`}>
                    <div className={`${c}-loading`}>
                        <Row>
                            <Col md={4}><LoaderIcon size={100} /></Col>
                            <Col md={8}>
                                <div className={`${c}-loading-text`}>Updating timeline...</div>
                            </Col>
                        </Row>
                    </div>
                </div>}

                {mode !== TimelinesOverlayMode.RequestingData &&
                <div className={`${c}-close`} onClick={this.handleCloseClick}>
                    {closeX}
                </div>
                }
            </div>
        );
    }

    private handleCloseClick = () => {
        const { handleShowConceptsChange } = this.props;
        handleShowConceptsChange();
    }

    private handlePanelCancelClick = () => {
        const { handleOverlayModeChange } = this.props;
        handleOverlayModeChange(TimelinesOverlayMode.WaitingForDrop);
        this.setState({ panel: undefined });
    }

    private handlePanelGetDataClick = () => {
        const { dispatch, handleOverlayModeChange, } = this.props;
        const { panel } = this.state;
        if (panel) {  
            dispatch(getConceptDataset(panel));
            handleOverlayModeChange(TimelinesOverlayMode.RequestingData);
        }
    }

    private handleConceptDrop = (concept: Concept) => {
        const { dispatch, handleOverlayModeChange } = this.props;
        const { hovered } = this.state;
        const panel = this.createPanel(concept);

        if (hovered == HoverDropType.All) {
            dispatch(getConceptDataset(panel));
            handleOverlayModeChange(TimelinesOverlayMode.RequestingData);
        } else {
            this.setState({ panel }, () =>
                handleOverlayModeChange(TimelinesOverlayMode.ConfiguringConcept)
            );
        }
    }

    private createPanel = (concept: Concept): PanelModel => {
        const panel = generateDummyPanel();
        panel.subPanels[0].panelItems[0].concept = concept;
        return panel;
    }

    private toggleUseAllData = (hovered: HoverDropType) => {
        if (hovered !== this.state.hovered) {
            this.setState({ hovered });
        }
    }

    /**
     * Panel handlers
     */
    private packageHandlers = () => {
        return {
            handlePanelInclusion: (panelIndex: number, include: boolean) => null as any,
            handleSubPanelInclusion: (panelIndex: number, subpanelIndex: number, include: boolean) => null as any,
            handlePanelDateFilter: this.handlePanelDateFilter,
            handleSubPanelCount: (panelIndex: number, subpanelIndex: number, minCount: number) => null as any,
            handleDeselectSpecialization: this.handleDeselectSpecialization,
            handleSelectSpecialization: this.handleSelectSpecialization,
            handleAddPanelItem: (concept: Concept, subPanel: SubPanel) => null as any,
            handlePanelItemNumericFilter: this.handlePanelItemNumericFilter,
            handleHidePanelItem: (panelItem: PanelItem) => null as any,
            handleRemovePanelItem: (panelItem: PanelItem) => null as any,
            handleSubPanelJoinSequence: (subPanel: SubPanel, joinSequence: SubPanelJoinSequence) => null as any
        };
    }

    private handlePanelDateFilter = (panelIndex: number, dateFilter: DateBoundary) => {
        const panel = Object.assign({}, this.state.panel, { dateFilter } );
        this.setState({ panel });
    }

    private handleDeselectSpecialization = (panelItem: PanelItem, conceptSpecializationGroup: ConceptSpecializationGroup) => {
        const pi = Object.assign({}, this.state.panel!.subPanels[0].panelItems[0]);
        const sp = Object.assign({}, this.state.panel!.subPanels[0]);
        const panel = Object.assign({}, this.state.panel, { subPanels: [{
            ...sp, panelItems: [{
                ...pi,
                specializations: pi.specializations.slice().filter((s) => s.specializationGroupId != conceptSpecializationGroup.id)
            }]
        }]});
        this.setState({ panel });
    }

    private handleSelectSpecialization = (panelItem: PanelItem, conceptSpecialization: ConceptSpecialization) => {
        const pi = Object.assign({}, this.state.panel!.subPanels[0].panelItems[0]);
        const sp = Object.assign({}, this.state.panel!.subPanels[0]);
        pi.specializations = pi.specializations.slice().filter((s) => s.specializationGroupId !== conceptSpecialization.specializationGroupId);
        pi.specializations.push(conceptSpecialization);
        const panel = Object.assign({}, this.state.panel, { subPanels: [{
            ...sp, panelItems: [ pi ]
        }]});
        this.setState({ panel });
    }

    private handlePanelItemNumericFilter = (panelItem: PanelItem, filter: NumericFilter) => {
        const pi = Object.assign({}, this.state.panel!.subPanels[0].panelItems[0]);
        const sp = Object.assign({}, this.state.panel!.subPanels[0]);
        pi.numericFilter = filter;
        const panel = Object.assign({}, this.state.panel, { subPanels: [{
            ...sp, panelItems: [ pi ]
        }]});
        this.setState({ panel });
    }
}

const TimelinesConceptDragOverlayContainer = DropTarget('CONCEPT', conceptNodeTarget, collectDrop)(TimelinesConceptDragOverlay);
export default TimelinesConceptDragOverlayContainer;