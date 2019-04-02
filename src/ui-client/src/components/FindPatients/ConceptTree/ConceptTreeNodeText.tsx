/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConnectDragPreview, ConnectDragSource, DropTargetMonitor, ConnectDropTarget, DropTarget, DropTargetConnector } from 'react-dnd'
import { Concept } from '../../../models/concept/Concept';
import { MdAccessTime } from 'react-icons/md';
import { GoPerson } from 'react-icons/go';
import { handleReparentDrop } from '../../../actions/admin/concept';

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
    allowReparent: boolean;
    concept: Concept;
    dispatch: any;
}

type Props = DndProps & OwnProps

const conceptNodeTarget = {
    drop(props: Props, monitor: DropTargetMonitor, component: any) {
        const { dispatch } = props;
        const concept: Concept = monitor.getItem();
        dispatch(handleReparentDrop(concept, props.concept.id));
    },
    canDrop(props: Props, monitor: DropTargetMonitor) {
        const con = (monitor.getItem() as Concept);
        return (
            props.allowReparent && 
            con !== props.concept && 
            !con.isExtension && 
            !props.concept.isExtension &&
            con.id !== props.concept.parentId
        );

    }
}

const collectDrop = (connect: DropTargetConnector, monitor: DropTargetMonitor) => {
    return ({
        canDrop: monitor.canDrop(),
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver({ shallow: true })
    });
};

class ConceptTreeNodeTextWrapper extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { concept, connectDropTarget, canDrop, isOver } = this.props;
        const c = 'concept-tree-node';
        const mainTextClasses = [ `${c}-text-wrapper`, (canDrop && isOver ? 'can-drop': '') ];
        const nodeTextClasses = [ `${c}-text` ];
        const showCount = (concept.uiDisplayPatientCount === 0 || concept.uiDisplayPatientCount) && concept.uiDisplayPatientCount > -1;
        const icon = concept.isEncounterBased 
            ? <MdAccessTime className={`${c}-icon ${c}-icon-clock`} /> 
            : <GoPerson className={`${c}-icon ${c}-icon-person`} />;

        if (concept.uiDisplayPatientCount === 0) { nodeTextClasses.push(`${c}-text-nopatients`); }
    
        return (
            connectDropTarget &&
            connectDropTarget(
                <div className={mainTextClasses.join(' ')}>
                    {icon}
                    <span className={nodeTextClasses.join(' ')}>{concept.uiDisplayName}</span>
                    {concept.uiDisplaySubtext &&
                    <span className={`${c}-subtext`}>{concept.uiDisplaySubtext}</span>}
                    {showCount && 
                    <span className={`${c}-count`}>
                        <GoPerson className={`${c}-icon ${c}-icon-lgm`} />
                        {concept.uiDisplayPatientCount}
                    </span>}
                </div>
            )
        );
    }
}

const ConceptTreeNodeTextWrapperContainer = DropTarget('CONCEPT', conceptNodeTarget, collectDrop)(ConceptTreeNodeTextWrapper);
export default ConceptTreeNodeTextWrapperContainer;