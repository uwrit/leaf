/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConnectDropTarget, DropTarget, DropTargetConnector, DropTargetMonitor } from 'react-dnd-cjs'
import { Concept } from '../../../models/concept/Concept';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import { PanelItem as PanelItemModel } from '../../../models/panel/PanelItem';
import { SubPanel as SubPanelModel } from '../../../models/panel/SubPanel';
import PanelItem from './PanelItem';
import PanelItemOr from './PanelItemOr';
import SubPanelDashBorder from './SubPanelDashBorder';
import SubPanelHeader from './SubPanelHeader';
import { CohortStateType } from '../../../models/state/CohortState';
import { PanelHandlers } from './PanelGroup';

interface DndProps {
    canDrop?: boolean;
    isOver?: boolean;
    connectDropTarget?: ConnectDropTarget;
}

interface OwnProps {
    handlers: PanelHandlers;
    panel: PanelModel;
    subPanel: SubPanelModel;
    index: number;
    queryState: CohortStateType;
}

type Props = DndProps & OwnProps

const panelTarget = {
    drop(props: Props, monitor: DropTargetMonitor) {
        const { handlers, subPanel } = props;
        const concept: Concept = monitor.getItem();
        handlers.handleAddPanelItem(concept, subPanel);
    },
    canDrop (props: Props, monitor: DropTargetMonitor) {
        return props.queryState !== CohortStateType.REQUESTING;
    }
}

const collect = (connect: DropTargetConnector, monitor: DropTargetMonitor) => ({
    canDrop: monitor.canDrop(),
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
});

class SubPanel extends React.Component<Props> {
    public render() {
        const { connectDropTarget, handlers, isOver, canDrop, subPanel, index, panel, queryState } = this.props;
        const totalPanelItems = subPanel.panelItems.length;
        const wrapperClasses = 'subpanel-wrapper ' + (totalPanelItems > 0 ? 'has-data' : '');
        const classes = [ 'subpanel' ];
        const items = [];
        let panelItem: PanelItemModel;

        // Set classes
        if (totalPanelItems === 0) { classes.push('no-data'); }
        if (isOver && canDrop)     { classes.push('can-drop'); }
        if (canDrop)               { classes.push('show-dash-border'); }
        if (subPanel.index === 0)  { classes.push('subpanel-first'); }

        // Set PanelItems and -or- objects
        for (let i = 0; i < totalPanelItems; i++) {
            panelItem = subPanel.panelItems[i];
            items.push(<PanelItem key={panelItem.id} panelItem={panelItem} handlers={handlers} subPanel={subPanel} queryState={queryState} />);

            // Add -or- if necessary
            if (subPanel.panelItems[i+1] &&         // Followed by another panelItem
                !subPanel.panelItems[i+1].hidden && // and the following panelItem isn't hidden
                (i > 0 || !panelItem.hidden)        // and this panelItem isn't the first OR is shown
            ) { 
                items.push(<PanelItemOr key={`_or_${panelItem.id}`}/>); 
            }
        }

        return (
            connectDropTarget &&
            connectDropTarget(
                <div className={wrapperClasses}>

                    {/* Header - only set if subpanel is not the first */}
                    {index !== 0 &&
                    <SubPanelHeader handlers={handlers} index={index} panel={panel} />}

                    <div className={classes.join(' ')}>

                        {/* Dashed borders that move when user is dragging a concept */}
                        <SubPanelDashBorder />
                        {/* Main subpanel body with panel items */}
                        <div className="subpanel-body">
                            {items}
                        </div>

                    </div>

                </div>
            )
        );
    }
}


export default DropTarget('CONCEPT', panelTarget, collect)(SubPanel) as any;