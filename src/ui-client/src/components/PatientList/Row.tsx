/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import Tuple from './Tuple';
import { FaChevronDown } from 'react-icons/fa';
import EncounterDetailGroup from './EncounterDetailGroup';
import { PatientListDetailEncounter, PatientListRow } from '../../models/patientList/Patient';
import { togglePatientRowOpen } from '../../actions/cohort/patientList';
import { PatientListColumn } from '../../models/patientList/Column';

interface Props {
    columns: PatientListColumn[];
    dispatch: any;
    index: number;
    row: PatientListRow;
}

export default class Row extends React.Component<Props> {
    private className = 'patientlist';

    public render() {
        const { columns, index, row } = this.props;
        const c = this.className;
        const rowClass = `${c}-row ${index % 2 === 0 ? 'even' : 'odd'}`;
        const openClass = row.isOpen ? 'open' : '';
        return ([
            (<tr 
                key={row.compoundId} className={rowClass} onClick={this.handleClick}>
                <td className={`${c}-tuple ${c}-detail-count ${openClass}`}>
                    View details ({row.detailRowCount ? row.detailRowCount : 0} rows)<FaChevronDown />
                </td>
                {row.values.map((v: any, i: number) => {
                    return <Tuple key={`${row.compoundId}_${columns[i].id}`} index={index} type={columns[i].type} value={v}/>
                })}
            </tr>),
            (<tr key={`${row.compoundId}_drilldown`} className={`${c}-row-drilldown ${openClass}`}>
                <td colSpan={columns.length}>
                    <div className={`${c}-tuple-detail-container`}>
                        {row.isOpen && row.detailValues.map((v: PatientListDetailEncounter) => {
                            return <EncounterDetailGroup key={v.encounterId} className={`${c}-tuple-detail`} data={v} />
                        })}
                    </div>
                </td>
            </tr>)
        ])
    }

    private handleClick = () => {
        const { dispatch, index } = this.props;
        dispatch(togglePatientRowOpen(index));
    }
}