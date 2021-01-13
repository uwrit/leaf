/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConnectDragPreview, ConnectDragSource, ConnectDropTarget, DropTarget, DropTargetConnector, DropTargetMonitor } from 'react-dnd';
import { MdAccessTime } from 'react-icons/md';
import { Button } from 'reactstrap';
import { getConceptDataset, getConceptPanelDataset } from '../../actions/cohort/timelines';
import { Concept } from '../../models/concept/Concept';
import { Panel as PanelModel } from '../../models/panel/Panel';
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
    configuringConcept: boolean;
    dispatch: any;
    handleConfiguringConceptChange: (configuringConcept: boolean) => any;
    timelines: TimelinesState;
    toggleOverlay: () => void;
}

type Props = DndProps & OwnProps

interface State {
    mode: OverlayMode,
    panel?: PanelModel
}

enum OverlayMode {
    Waiting = 1,
    Selected = 2
}

/**
 * Dnd handlers
 */
let conceptDropFunc = (concept: Concept) => {};
const conceptNodeTarget = {
    drop(props: Props, monitor: DropTargetMonitor, component: any) {
        const { dispatch, timelines } = props;
        const concept: Concept = monitor.getItem();
        const loadingConcept = timelines.state === CohortStateType.REQUESTING;

        if (loadingConcept || timelines.panelItemByConcept.get(concept.id)) {
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
            mode: OverlayMode.Waiting
        }
    }

    public render() {
        const c = this.className;
        const { mode, panel } = this.state;
        const { connectDropTarget, canDrop, isOver, timelines } = this.props;
        const clock = <MdAccessTime className={'concept-tree-node-icon concept-tree-node-icon-clock'} />;
        const loadingConcept = timelines.state === CohortStateType.REQUESTING;

        return (
            <div className={`${c} ${canDrop && isOver ? 'can-drop' : ''}`}>

                {/* User picking Concepts */}
                {mode === OverlayMode.Waiting && !loadingConcept &&
                connectDropTarget &&
                connectDropTarget(
                <div className={`${c}-inner waiting`}>
                    <div>
                        {!loadingConcept && 
                        <div>Drop any Concept with associated dates (the {clock} symbol) here</div>
                        }
                    </div>
                </div>)}

                {/* Concept dropped */}
                {mode === OverlayMode.Selected && panel &&
                <div className={`${c}-inner selecting`}>
                    <div className={`${c}-panel-selection-container`}>
                        <Panel panel={panel} isFirst={true} queryState={CohortStateType.LOADED}/>
                        <div className={`${c}-panel-selection-explanation`}>
                            <span>Specify any date, numeric, or other filters, then click</span>
                            <span className={`${c}-panel-selection-emphasis`}>Get Timeline of Data</span>
                            <span>below</span>
                        </div>
                        <div className={`${c}-panel-selection-footer`}>
                            <Button className='leaf-button leaf-button-secondary' onClick={this.handlePanelCancelClick}>Cancel</Button>
                            <Button className='leaf-button leaf-button-primary' onClick={this.handlePanelGetDataClick}>Add to Timeline</Button>
                        </div>
                    </div>
                </div>}

                {/* Concept requested */}
                {loadingConcept && 
                <div className={`${c}-inner update`}>
                    <div>
                        <div className={`${c}-loading`}><LoaderIcon size={30} /> Updating timeline...</div>
                    </div>
                </div>}
            </div>
        );
    }

    private handlePanelCancelClick = () => {
        const { handleConfiguringConceptChange } = this.props;
        handleConfiguringConceptChange(false);
        this.setState({ panel: undefined, mode: OverlayMode.Waiting});
    }

    private handlePanelGetDataClick = () => {
        const { dispatch } = this.props;
        const { panel } = this.state;
        if (panel) {
            dispatch(getConceptPanelDataset(panel));
        }
    }

    private handleConceptDrop = (concept: Concept) => {
        const { handleConfiguringConceptChange } = this.props;
        handleConfiguringConceptChange(true);
        this.setState({ 
            panel: this.createPanel(concept),
            mode: OverlayMode.Selected
        });
    }

    private createPanel = (concept: Concept): PanelModel => {
        const panel = generateDummyPanel();
        panel.subPanels[0].panelItems[0].concept = concept;
        return panel;
    }
}

const TimelinesConceptDragOverlayContainer = DropTarget('CONCEPT', conceptNodeTarget, collectDrop)(TimelinesConceptDragOverlay);
export default TimelinesConceptDragOverlayContainer;