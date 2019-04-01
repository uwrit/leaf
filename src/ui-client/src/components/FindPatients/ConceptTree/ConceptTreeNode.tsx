/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConnectDragPreview, ConnectDragSource, DragSource, DragSourceConnector, DragSourceMonitor, DropTargetMonitor, ConnectDropTarget, DropTarget, DropTargetConnector } from 'react-dnd'
import { Collapse } from 'reactstrap';
import { ConceptMap } from '../../../models/state/AppState';
import { Concept } from '../../../models/concept/Concept';
import getDragPreview from '../../../utils/getDragPreview';
import LearnMoreButton from './LearnMoreButton';
import ConceptTreeNodeText from './ConceptTreeNodeText';
import { handleConceptClick, fetchConceptChildrenIfNeeded } from '../../../actions/concepts';
import LoaderIcon from '../../Other/LoaderIcon/LoaderIcon';

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

const collectDrag = (connect: DragSourceConnector, monitor: DragSourceMonitor) => {
    return ({
        connectDragPreview: connect.dragPreview(),
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
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

    public render() {
        const { 
            allowReparent, allowRerender, concept, concepts, dispatch, parentShown, selectedId,
            canDrop, connectDragSource, isOver
        } = this.props;
        const c = 'concept-tree-node';
        const nodeTextClasses = [ `${c}-text` ];
        const arrowClasses = [ `${c}-arrow` ];
        const mainClasses = [ c ];

        if (concept.uiDisplayPatientCount === 0) { nodeTextClasses.push(`${c}-text-nopatients`); }
        if (concept.id === selectedId)           { mainClasses.push(`selected`); }

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
                        <div className={mainClasses.join(' ')} onMouseDown={this.handleClick}>

                            {/* Drilldown arrow */}
                            <div className={`${c}-arrow-wrapper`}>
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

                            {/* Main Text */}
                            <ConceptTreeNodeText
                                allowReparent={allowReparent}
                                concept={concept}
                                dispatch={dispatch}
                            />

                            {/* Learn More */}
                            <LearnMoreButton concept={concept} />
                        </div>
                        <div>

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
                        </div>
                    </li>
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