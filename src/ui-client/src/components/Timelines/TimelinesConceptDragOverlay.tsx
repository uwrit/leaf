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
    toggleOverlay: () => void;
}

type Props = DndProps & OwnProps

const conceptNodeTarget = {
    drop(props: Props, monitor: DropTargetMonitor, component: any) {
        const { dispatch } = props;
        const concept: Concept = monitor.getItem();

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

class TimelinesConceptDragOverlay extends React.Component<Props> {
    private className = 'timelines-concept-drag-overlay';

    public render() {
        const c = this.className;
        const { connectDropTarget, canDrop, isOver } = this.props;
        const clock = <MdAccessTime className={'concept-tree-node-icon concept-tree-node-icon-clock'} />;

        return (
            connectDropTarget &&
            connectDropTarget(
                <div className={`${c} ${canDrop && isOver ? 'can-drop' : ''}`}>
                    <div className={`${c}-inner`}>
                        <p>
                            Drag any Concept that has dates (the {clock} symbol) here
                        </p>
                    </div>
                </div>
            )
        );
    }
}

const TimelinesConceptDragOverlayContainer = DropTarget('CONCEPT', conceptNodeTarget, collectDrop)(TimelinesConceptDragOverlay);
export default TimelinesConceptDragOverlayContainer;