/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConnectDragPreview, ConnectDragSource, DragSource, DragSourceConnector, DragSourceMonitor, DropTargetMonitor, ConnectDropTarget, DropTarget, DropTargetConnector } from 'react-dnd'
import { GoPerson } from 'react-icons/go'
import { MdAccessTime } from 'react-icons/md'
import { Collapse } from 'reactstrap';
import { ConceptMap } from '../../../models/state/AppState';
import { Concept } from '../../../models/concept/Concept';
import getDragPreview from '../../../utils/getDragPreview';
import LoaderIcon from '../../Other/LoaderIcon/LoaderIcon'
import LearnMoreButton from './LearnMoreButton';
import { handleConceptClick, fetchConceptChildrenIfNeeded } from '../../../actions/concepts';
import { compose } from 'redux';
import { findDOMNode } from 'react-dom';

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
    allowRerender: Set<string>;
    concept: Concept;
    concepts: ConceptMap;
    dispatch: any;
    parentShown: boolean;
    selectedId: string;
}

type Props = DndProps & OwnProps

// Object to return to the connector when drag begins. This will
// be sent to the panel on the drop() event.
const conceptNodeSource = {
    beginDrag(props: Props) {
        return props.concept;
    }
}

const conceptNodeTarget = {
    drop(props: Props, monitor: DropTargetMonitor, component: any) {
        const { dispatch } = props;
        const concept: Concept = monitor.getItem();
        console.log(concept, props.concept);
    },
    canDrop(props: Props, monitor: DropTargetMonitor) {
        return props.allowReparent && (monitor.getItem() as Concept) !== props.concept;
    }
}

const collectDrag = (connect: DragSourceConnector, monitor: DragSourceMonitor) => {
    return ({
        connectDragPreview: connect.dragPreview(),
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    });
};

const collectDrop = (connect: DropTargetConnector, monitor: DropTargetMonitor) => {
    return ({
        canDrop: monitor.canDrop(),
        connectDropTarget: connect.dropTarget(),
        clientOffset: monitor.getSourceClientOffset(),
        isOver: monitor.isOver()
    });
};

class ConceptTreeNode extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public componentDidMount() {
        const { connectDragPreview } = this.props;
        if (connectDragPreview) {
            // Create the drag image.
            // Note: HTML5 (out of the box) can only
            // display images/canvas, so we are converting
            // text and styles to a canvas image.
            const dragPreview = getDragPreview(this.props.concept.uiDisplayName);
            connectDragPreview(dragPreview);
        }
    }

    public render(): any {
        const { 
            allowReparent, allowRerender, concept, concepts, dispatch, parentShown, selectedId,
            canDrop, connectDragSource, isOver
        } = this.props;
        const c = 'concept-tree-node';
        const arrowClasses = [ `${c}-arrow` ];
        const nodeTextClasses = [ `${c}-text` ];
        const mainClasses = [ c ];
        const showCount = (concept.uiDisplayPatientCount === 0 || concept.uiDisplayPatientCount) && concept.uiDisplayPatientCount > -1;
        const icon = concept.isEncounterBased 
            ? <MdAccessTime className={`${c}-icon ${c}-icon-clock`} /> 
            : <GoPerson className={`${c}-icon ${c}-icon-person`} />;

        if (concept.uiDisplayPatientCount === 0)              { nodeTextClasses.push(`${c}-text-nopatients`); }
        if ((isOver && canDrop) || concept.id === selectedId) { mainClasses.push(`selected`); }
        
        // Set arrow state
        if (concept.isParent) {
            if (concept.isOpen && concept.childrenIds) {
                arrowClasses.push(`${c}-arrow-expanded`);
            }
        } else {
            arrowClasses.push(`${c}-arrow-hidden`);
        }

        return (
            connectDragSource &&
            connectDragSource(
                <ul className={`${c}-wrapper`}>
                    <li>
                        <div className={mainClasses.join(' ')} onClick={this.handleClick}>
                            <div className={`${c}-arrow-wrapper`}>
                                {/* Drilldown arrow */}
                                {!concept.isFetching &&
                                <span
                                    className={arrowClasses.join(' ')}
                                    onClick={this.handleArrowClick}
                                />
                                }
                                {/* Loader, shown when calling server */}
                                {concept.isFetching &&
                                <LoaderIcon />
                                }
                            </div>
                            {/* Concept name */}
                            <div className={`${c}-text-wrapper`}>
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
                            <LearnMoreButton concept={concept} />
                        </div>
                    </li>
                    {/* Collapse wrapper for children */}
                    {concept.isParent && parentShown && (
                        <Collapse 
                            isOpen={concept.isOpen} 
                            className={`${c}-child-container`}>
                            {concept.childrenIds && 
                            Array.from(concept.childrenIds).map((childId) => (
                                <ConceptTreeNodeContainer 
                                    key={childId}
                                    allowReparent={allowReparent}
                                    allowRerender={allowRerender}
                                    concept={concepts.get(childId)!}
                                    concepts={concepts}
                                    dispatch={dispatch}
                                    parentShown={concept.isOpen}
                                    selectedId={selectedId}
                                />
                            ))}
                        </Collapse>
                    )}
                </ul>
            )
        );
    }

    private handleClick = () => {
        const { dispatch, concept } = this.props;
        dispatch(handleConceptClick(concept));
    }

    private handleArrowClick = () => {
        const { dispatch, concept } = this.props;
        dispatch(fetchConceptChildrenIfNeeded(concept));
    }
}

const ConceptTreeNodeContainer = DragSource('CONCEPT', conceptNodeSource, collectDrag)(ConceptTreeNode);
export default ConceptTreeNodeContainer;

/*
const ConceptTreeNodeContainer = compose(
    DropTarget('CONCEPT', conceptNodeTarget, collectDrop),
    DragSource('CONCEPT', conceptNodeSource, collectDrag)
)(ConceptTreeNode) as any;
export default ConceptTreeNodeContainer;
*/

/*
const SubPanelContainer = compose(
    connect(null, mapDispatchToProps),
    DropTarget('CONCEPT', panelTarget, collect)
)(SubPanel) as any;
export default SubPanelContainer;
*/