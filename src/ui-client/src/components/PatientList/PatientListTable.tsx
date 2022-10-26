/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { getCurrentPatientList } from '../../actions/cohort/patientList';
import { PatientListState } from '../../models/state/CohortState';
import { NetworkResponderMap } from '../../models/NetworkResponder';
import { PatientListColumn } from '../../models/patientList/Column';
import { PatientListRow } from '../../models/patientList/Patient';
import { PatientListSortType, PatientListSort } from '../../models/patientList/Configuration';
import Header from './Header';
import Row from './Row';
import './PatientListTable.css';

interface Props {
    className?: string;
    dispatch: any;
    patientList: PatientListState;
    responders: NetworkResponderMap;
}

interface State {
    hidden: boolean;
}

export default class PatientListTable extends React.PureComponent<Props, State> {
    private prevRows = 0;

    constructor(props: Props) {
        super(props);
        this.state = {
            hidden: true
        }
    }
    
    public componentDidMount() {
        setTimeout(() => this.setState({ hidden: false }), 100);
    }

    public render() {
        const { patientList, dispatch, className } = this.props;
        const c = className ? className : 'patientlist';
        const sort = patientList.configuration.sort;
        const classes = [ `${c}-table-container`, (this.state.hidden ? 'hidden' : '') ];
        const cols = patientList ? this.props.patientList.configuration.displayColumns : [];

        return (    
            <div className={classes.join(' ')}>
                <div className={`${c}-container-overlay`} /> 
                <table className={`${c}-table`}>
                
                    {/* Header */}
                    <thead className={`${c}-header`}>
                        <tr>
                            {/* Empty column for detail rows */}
                            <td />

                            {/* Columns */}
                            {cols.map((col: PatientListColumn) => (
                                <Header 
                                    data={col}
                                    renames={patientList.configuration.customColumnNames}
                                    dispatch={dispatch}
                                    key={`${col.datasetId}_${col.id}`}
                                    onClick={this.handleHeaderCellClick.bind(null, col.index)}
                                    sort={sort} 
                                />
                            ))}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody className={`${c}-body`}>

                        {/* Rows */}
                        {patientList.display.map((r: PatientListRow, idx: number) => (
                            <Row 
                                columns={cols}
                                dispatch={dispatch}
                                index={idx}
                                row={r}
                                key={r.compoundId}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    private handleHeaderCellClick = (idx: number) => {
        const { dispatch, patientList } = this.props;
        const cols = patientList.configuration.displayColumns;
        const pl = patientList;
        const prevSortCol = pl.configuration.sort.column;
        const col = cols[idx];

        const currentSort = col && prevSortCol && prevSortCol.id === col.id
            ? pl.configuration.sort.sortType
            : PatientListSortType.NONE;
        const newSortType = 
            currentSort === PatientListSortType.ASC ? PatientListSortType.DESC : 
            currentSort === PatientListSortType.DESC ? PatientListSortType.NONE :
            PatientListSortType.ASC;

        const newSort: PatientListSort = {
            column: col,
            sortType: newSortType
        };
        
        dispatch(getCurrentPatientList(newSort));
    }
}