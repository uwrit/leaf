/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConnectDragPreview, ConnectDragSource, ConnectDropTarget, DropTarget, DropTargetConnector, DropTargetMonitor } from 'react-dnd';
import { MdAccessTime } from 'react-icons/md';
import { getConceptDataset } from '../../actions/cohort/timelines';
import { Concept } from '../../models/concept/Concept';
import { CohortStateType, TimelinesState } from '../../models/state/CohortState';
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
    timelines: TimelinesState;
    toggleOverlay: () => void;
}

type Props = DndProps & OwnProps

const conceptNodeTarget = {
    drop(props: Props, monitor: DropTargetMonitor, component: any) {
        const { dispatch, timelines } = props;
        const concept: Concept = monitor.getItem();
        const loadingConcept = [ ...timelines.stateByConcept.values() ].find((s) => s === CohortStateType.REQUESTING);

        if (loadingConcept || timelines.stateByConcept.get(concept.id)) {
            return;
        }

        dispatch(getConceptDataset(concept));
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

class TimelinesConceptDragOverlay extends React.PureComponent<Props> {
    private className = 'timelines-concept-drag-overlay';

    public render() {
        const c = this.className;
        const { connectDropTarget, canDrop, isOver, timelines } = this.props;
        const clock = <MdAccessTime className={'concept-tree-node-icon concept-tree-node-icon-clock'} />;
        const loadingConcept = [ ...timelines.stateByConcept.values() ].find((s) => s === CohortStateType.REQUESTING);

        return (
            connectDropTarget &&
            connectDropTarget(
                <div className={`${c} ${canDrop && isOver ? 'can-drop' : ''}`}>
                    <div className={`${c}-inner`}>

                        <div>
                            {!loadingConcept && 
                            <div>Drop any Concept with associated dates (the {clock} symbol) here</div>
                            }
                            {loadingConcept && 
                            <div className={`${c}-loading`}><LoaderIcon size={30} /> Updating timeline...</div>
                            }
                        </div>

                    </div>
                </div>
            )
        );
    }
}

const TimelinesConceptDragOverlayContainer = DropTarget('CONCEPT', conceptNodeTarget, collectDrop)(TimelinesConceptDragOverlay);
export default TimelinesConceptDragOverlayContainer;