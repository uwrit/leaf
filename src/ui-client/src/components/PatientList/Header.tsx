/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConnectDragPreview, ConnectDragSource, ConnectDropTarget, DragSource, DragSourceConnector, DragSourceMonitor, DropTarget, DropTargetConnector, DropTargetMonitor } from 'react-dnd'
import { reorderColumns } from '../../actions/cohort/patientList';
import { compose } from 'redux';
import { PatientListColumn } from '../../models/patientList/Column';
import { PatientListSort, PatientListSortType, PatientListDndType } from '../../models/patientList/Configuration';

interface OwnProps {
    className?: string;
    data: PatientListColumn;
    dispatch: any;
    onClick: (idx: number) => any;
    sort: PatientListSort;
}

interface DndProps {
    connectDragSource?: ConnectDragSource;
    isDragging?: boolean;
    isDropped?: boolean;
    canDrop?: boolean;
    isOver?: boolean;
    connectDropTarget?: ConnectDropTarget;
    connectDragPreview?: ConnectDragPreview;
}

type Props = OwnProps & DndProps;

let sourceColumn: any;

const columnSource = {
    beginDrag(props: Props) {
        sourceColumn = props.data;
        return props.data;
    }
};

const columnTarget = {
    drop(props: Props) {
        props.dispatch(reorderColumns(sourceColumn, props.data));
        return props.data;
    }
};

const collectTarget = (connector: DropTargetConnector, monitor: DropTargetMonitor) => ({
    canDrop: monitor.canDrop(),
    connectDropTarget: connector.dropTarget(),
    isOver: monitor.isOver()
});

const collectSource = (connector: DragSourceConnector, monitor: DragSourceMonitor) => ({
    connectDragPreview: connector.dragPreview(),
    connectDragSource: connector.dragSource(),
    isDragging: monitor.isDragging()
});

class Header extends React.Component<Props> {
    public render() {
        const { connectDragSource, connectDropTarget, connectDragPreview, data, onClick, isOver, canDrop, isDragging, sort, className } = this.props;
        const c = className ? className : 'patientlist';
        const classes = [ `${c}-column-header` ];

        if (isOver && canDrop) { classes.push('can-drop'); }
        if (isDragging)        { classes.push('is-dragging'); }

        if (sort.column && sort.column!.id === data.id) {
            if (sort.sortType === PatientListSortType.ASC)       { classes.push('sort-asc'); }
            else if (sort.sortType === PatientListSortType.DESC) { classes.push('sort-desc'); }
        }

        return (
            connectDragPreview!(
            connectDragSource!(
            connectDropTarget!(
                <th 
                    className={classes.join(' ')}
                    onClick={onClick.bind(null, data.index)}>
                    {this.props.data.displayName}
                </th>
            )))
        )
    }
}

const HeaderContainer = compose(
    DragSource(PatientListDndType.COLUMN_HEADER, columnSource, collectSource),
    DropTarget(PatientListDndType.COLUMN_HEADER, columnTarget, collectTarget)
)(Header) as any;
export default HeaderContainer