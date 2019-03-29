/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { PatientListColumn } from '../../models/patientList/Column';
import { PatientListSort, PatientListSortType } from '../../models/patientList/Configuration';

interface Props {
    className?: string;
    data: PatientListColumn;
    dispatch: any;
    onClick: (idx: number) => any;
    sort: PatientListSort;
}

export default class NonDragHeader extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { sort, className, onClick, data } = this.props;
        const c = className ? className : 'patientlist';
        const classes = [ `${c}-column-header` ];

        if (sort.column && sort.column!.id === data.id) {
            if (sort.sortType === PatientListSortType.ASC)       { classes.push('sort-asc'); }
            else if (sort.sortType === PatientListSortType.DESC) { classes.push('sort-desc'); }
        }

        return (
            <th 
                className={classes.join(' ')}
                onClick={onClick.bind(null, data.index)}>
                {this.props.data.displayName}
            </th>
        );
    }
}