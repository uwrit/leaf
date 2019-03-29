/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConnectDragPreview, ConnectDragSource, DragSource, DragSourceConnector, DragSourceMonitor } from 'react-dnd'
import { GoPerson } from 'react-icons/go'
import { MdAccessTime } from 'react-icons/md'
import { Collapse } from 'reactstrap';
import { ConceptMap } from '../../../models/state/AppState';
import { Concept } from '../../../models/concept/Concept';
import getDragPreview from '../../../utils/getDragPreview';
import LoaderIcon from '../../Other/LoaderIcon/LoaderIcon'
import LearnMoreButton from './LearnMoreButton';

interface Props {
    allowRerender: Set<string>;
    concept: Concept;
    concepts: ConceptMap;
    onArrowClick: (c: Concept) => void;
    onClick: (c: Concept) => void;
    connectDragSource?: ConnectDragSource;
    connectDragPreview?: ConnectDragPreview;
    isDragging?: boolean;
    isDropped?: boolean;
    parentShown: boolean;
    selectedId: string;
}

// Object to return to the connector when drag begins. This will
// be sent to the panel on the drop() event.
const conceptNodeSource = {
    beginDrag(props: Props) {
        return props.concept;
    }
}

const collect = (connect: DragSourceConnector, monitor: DragSourceMonitor) => {
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

    public render(): any {
        const { allowRerender, concept, concepts, connectDragSource, onClick, onArrowClick, parentShown, selectedId } = this.props;
        const c = 'concept-tree-node';
        const arrowClasses = [ `${c}-arrow` ];
        const nodeTextClasses = [ `${c}-text` ];
        const mainClasses = [ c ];
        const showCount = (concept.uiDisplayPatientCount === 0 || concept.uiDisplayPatientCount) && concept.uiDisplayPatientCount > -1 ? true : false;
        const icon = concept.isEncounterBased 
            ? <MdAccessTime className={`${c}-icon ${c}-icon-clock`} /> 
            : <GoPerson className={`${c}-icon ${c}-icon-person`} />;

        if (concept.uiDisplayPatientCount === 0) { nodeTextClasses.push(`${c}-text-nopatients`); }
        if (concept.id === selectedId)           { mainClasses.push(`selected`); }
        
        // Set arrow state and display if parent
        if (concept.isParent) {
            // Render an array of nested children concepts if showChildren is true
            if (concept.isOpen && concept.childrenIds) {
                // Update arrow class to rotate if children are shown
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
                        <div className={mainClasses.join(' ')} onClick={onClick.bind(null, concept)}>
                            <div className={`${c}-arrow-wrapper`}>
                                {/* Drilldown arrow */}
                                {!concept.isFetching &&
                                <span
                                    className={arrowClasses.join(' ')}
                                    onClick={onArrowClick.bind(null, concept)}
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
                                    allowRerender={allowRerender}
                                    concept={concepts.get(childId)!}
                                    concepts={concepts}
                                    onClick={onClick}
                                    onArrowClick={onArrowClick}
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
}

const ConceptTreeNodeContainer = DragSource('CONCEPT', conceptNodeSource, collect)(ConceptTreeNode);
export default ConceptTreeNodeContainer;