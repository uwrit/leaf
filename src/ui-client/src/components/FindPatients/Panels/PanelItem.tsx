/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConnectDragPreview, ConnectDragSource, DragSource, DragSourceConnector, DragSourceMonitor } from 'react-dnd'
import { connect } from 'react-redux';
import { removePanelItem, hidePanelItem } from '../../../actions/panels';
import { PanelItem as PanelItemModel } from '../../../models/panel/PanelItem';
import { compose } from 'redux';
import getDragPreview from '../../../utils/getDragPreview';
import PanelItemNumericFilter from './PanelItemNumericFilter';
import ConceptSpecializationGroup from './ConceptSpecializationGroup';

interface Props {
    panelItem: PanelItemModel,
    connectDragSource?: ConnectDragSource,
    connectDragPreview?: ConnectDragPreview,
    isDragging?: boolean,
    isDropped?: boolean,
    dispatch?: any
}

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
    }
};

const collect = (connect: DragSourceConnector, monitor: DragSourceMonitor) => {
    return {
        connectDragPreview: connect.dragPreview(),
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
};

export class PanelItem extends React.Component<Props> {
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
        const { connectDragSource, dispatch, panelItem } = this.props;
        const { concept, specializations } = panelItem;
        const classes = [ 'panel-item' ]; 
        
        if (panelItem.hidden)          classes.push('hidden');
        if (!concept.isEncounterBased) classes.push('panel-item-not-encounter-based'); 
        else                           classes.push('panel-item-encounter-based');

        return (
            connectDragSource &&
            connectDragSource(
                <div className={classes.join(' ')}>
                    <span>{concept.uiDisplayText}</span>
                    {concept.isSpecializable && concept.specializationGroups &&
                    concept.specializationGroups.map((g) => {
                        return (
                            <ConceptSpecializationGroup 
                                dispatch={dispatch} 
                                key={g.id} 
                                panelItem={panelItem} 
                                selected={specializations} 
                                specializationGroup={g} />
                        )
                    })}
                    {concept.isNumeric &&
                    <PanelItemNumericFilter panelItem={this.props.panelItem} />
                    }
                </div>
            )
        );
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return { 
        dispatch
    };
};

// export default reduxConnect(null, mapDispatchToProps)(PanelItem);
export default compose(
    connect(null, mapDispatchToProps),
    DragSource('CONCEPT', conceptNodeSource, collect)
)(PanelItem) as any;
