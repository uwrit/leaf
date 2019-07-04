/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConnectDragPreview, ConnectDragSource, DragSource, DragSourceConnector, DragSourceMonitor } from 'react-dnd'
import { removePanelItem, hidePanelItem } from '../../../actions/panels';
import { PanelItem as PanelItemModel } from '../../../models/panel/PanelItem';
import getDragPreview from '../../../utils/getDragPreview';
import PanelItemNumericFilter from './PanelItemNumericFilter';
import ConceptSpecializationGroup from './ConceptSpecializationGroup';
import { SubPanel, SequenceType } from '../../../models/panel/SubPanel';
import { CohortStateType } from '../../../models/state/CohortState';

interface DndProps {
    connectDragSource?: ConnectDragSource;
    connectDragPreview?: ConnectDragPreview;
    canDrag?: boolean;
    isDragging?: boolean;
    isDropped?: boolean;
}

interface OwnProps {
    dispatch: any;
    panelItem: PanelItemModel;
    queryState: CohortStateType;
    subPanel: SubPanel;
}

type Props = DndProps & OwnProps

// Object to return to the connector when drag begins. This will
// be sent to the panel on the drop() event.
const conceptNodeSource = {
    beginDrag(props: Props) {
        const { dispatch, panelItem } = props;
        /*
         * Hide the panel item, but keep in DOM until drop event. This is needed
         * so React-dnd can detect the drop has occurred (and thus update UI correctly),
         * which is based partly off of a detection of whether the node is still in the DOM.
         * The timeout is needed because Chrome/Safari have an unrelated bug related to 
         * Html5 dnd events on hidden DOM objects. Odd as it seems, this flow seems to work well.
         */
        setTimeout(() => {
            dispatch(hidePanelItem(panelItem.concept, panelItem.panelIndex, panelItem.subPanelIndex, panelItem.index));
        }, 50);
        return panelItem.concept;
    },
    endDrag(props: Props) {
        const { dispatch, panelItem } = props;
        dispatch(removePanelItem(panelItem.concept, panelItem.panelIndex, panelItem.subPanelIndex, panelItem.index));
    },
    canDrag(props: Props) {
        return props.queryState !== CohortStateType.REQUESTING;
    }
};

const collect = (connect: DragSourceConnector, monitor: DragSourceMonitor) => {
    return {
        canDrag: monitor.canDrag(),
        connectDragPreview: connect.dragPreview(),
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
};

export class PanelItem extends React.Component<Props> {
    private className = 'panel-item';
    constructor(props: Props) {
        super(props);
        this.state = {
            showNumericFilterTooltip: false
        }
    }

    public componentDidMount() {
        const { connectDragPreview, panelItem } = this.props;
        if (connectDragPreview) {
            const dragPreview = getDragPreview(panelItem.concept.uiDisplayName);
            connectDragPreview(dragPreview);
        }
    }
    
    public render(): any {
        const { connectDragSource, dispatch, panelItem, subPanel, canDrag } = this.props;
        const { concept, specializations } = panelItem;
        const c = this.className;
        const classes = [ c ]; 
        if (!panelItem.concept) { return null; }
        
        const eventJoin = subPanel.joinSequenceEventType;
        const eventId = panelItem.concept.eventTypeId;
        const invalidEventId = 
            eventJoin && 
            subPanel.joinSequence.sequenceType === SequenceType.Event && 
            eventJoin.id !== eventId;
        
        if (panelItem.hidden)          classes.push('hidden');
        if (!canDrag)                  classes.push(`cannot-drag`);
        if (invalidEventId)            classes.push(`${c}-invalid-eventid`);
        if (!concept.isEncounterBased) classes.push(`${c}-not-encounter-based`); 
        else                           classes.push(`${c}-encounter-based`);

        return (
            connectDragSource &&
            connectDragSource(
                <div className={classes.join(' ')}>
                    <span className={`${c}-text`}>{concept.uiDisplayText}</span>
                    {concept.isSpecializable && concept.specializationGroups &&
                     concept.specializationGroups.map((g) => (
                        <ConceptSpecializationGroup 
                            dispatch={dispatch} 
                            key={g.id} 
                            panelItem={panelItem} 
                            selected={specializations} 
                            specializationGroup={g} 
                        />
                    ))}
                    {concept.isNumeric &&
                    <PanelItemNumericFilter panelItem={panelItem} dispatch={dispatch}/>
                    }
                    {invalidEventId &&
                    <span className={`${c}-invalid-eventid-info`}>
                        Whoops! This query is linked by <span className={`${c}-emphasis`}>{subPanel.joinSequenceEventType!.name}</span>
                        , but this Concept doesn't seem to be the right type. Please fix this before running a query.
                    </span>
                    }
                </div>
            )
        );
    }
}


export default DragSource('CONCEPT', conceptNodeSource, collect)(PanelItem) as any;
