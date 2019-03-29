/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { Collapse } from 'reactstrap';
import { getCurrentPatientList } from '../../actions/cohort/patientList';
import { togglePatientRowOpen } from '../../actions/cohort/patientList';
import { PatientListState } from '../../models/state/CohortState';
import { NetworkRespondentMap } from '../../models/NetworkRespondent';
import EncounterDetailGroup from './EncounterDetailGroup';
import Header from './Header';
import Tuple from './Tuple';
import { PatientListColumn } from '../../models/patientList/Column';
import { PatientListRow, PatientListDetailEncounter } from '../../models/patientList/Patient';
import { PatientListSortType, PatientListSort } from '../../models/patientList/Configuration';
import './PatientListTable.css';

interface Props {
    className?: string;
    dispatch: any;
    patientList: PatientListState;
    respondents: NetworkRespondentMap;
}

interface State {
    hidden: boolean;
}

export default class PatientListTable extends React.PureComponent<Props, State> {
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
        const { patientList, dispatch, className, respondents } = this.props;
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
                            {cols.map((col: PatientListColumn) => {
                                return (
                                    <Header 
                                        data={col}
                                        dispatch={dispatch}
                                        key={`${col.datasetId}_${col.id}`}
                                        onClick={this.handleHeaderCellClick.bind(null, col.index)}
                                        sort={sort} 
                                    />
                                )
                            })}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody className={`${c}-body`}>

                        {/* Rows */}
                        {patientList.display.map((r: PatientListRow, idx: number) => {
                            const rowClass = `${c}-row ${idx % 2 === 0 ? 'even' : 'odd'}`;
                            const openClass = r.isOpen ? 'open' : '';
                            return ([
                                (<tr 
                                    key={r.compoundId} className={rowClass} onClick={this.handlePatientRowClick.bind(null, idx)}>
                                    <td className={`${c}-tuple ${c}-detail-count ${openClass}`}>
                                        View details ({r.detailRowCount ? r.detailRowCount : 0} rows)<FaChevronDown />
                                    </td>
                                    {r.values.map((v: any, i: number) => {
                                        return <Tuple key={`${r.compoundId}_${cols[i].id}`} index={idx} type={cols[i].type} value={v}/>
                                    })}
                                </tr>),
                                (<tr key={`${r.compoundId}_drilldown`} className={`${c}-row-drilldown ${openClass}`}>
                                    <td colSpan={cols.length}>
                                        <Collapse className={`${c}-tuple-detail-container`} isOpen={r.isOpen}>
                                            {r.isOpen && r.detailValues.map((v: PatientListDetailEncounter) => {
                                                return <EncounterDetailGroup key={v.encounterId} className={`${c}-tuple-detail`} data={v} />
                                            })}
                                        </Collapse>
                                    </td>
                                </tr>)
                            ])
                        })}
                    </tbody>
                </table>
            </div>
        )
    }

    private handlePatientRowClick = (idx: number) => {
        this.props.dispatch(togglePatientRowOpen(idx));
    }

    private handleHeaderCellClick = (idx: number) => {
        const cols = this.props.patientList.configuration.displayColumns;
        const pl = this.props.patientList;
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
        
        this.props.dispatch(getCurrentPatientList(newSort));
    }
}