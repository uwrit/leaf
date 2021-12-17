/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { PatientListDetailEncounter, PatientListDetailEncounterRow, PatientListDetailEncounterKeyValue } from '../../models/patientList/Patient';

interface Props {
    className?: string;
    data: PatientListDetailEncounter;
}

export default class EncounterDetailGroup extends React.PureComponent<Props> {
    public render() {
        const { className, data } = this.props;
        const c = className ? className : 'patientlist-tuple-detail';

        return (
            <div key={data.encounterId} className={`${c}-encounter`}>
                <table key={data.encounterId} className={`${c}-encounter-table`}>
                    <thead>
                        <tr>
                            <th>
                                <div className={`${c}-encounter-text`}>Encounter</div>
                                <div className={`${c}-encounter-value`}>{data.encounterId}</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((dr: PatientListDetailEncounterRow, j: number) => {
                            return (
                                <tr key={j} className={`${c}-row`}>
                                    <td className={`${c}-row-datasetname`}>
                                        {dr.datasetName}
                                    </td>
                                    <td className={`${c}-column`}>
                                        <div className={`${c}-column-name`}>{dr.dateColumnName}</div>
                                        <div className={`${c}-column-value`}>{dr.date.toLocaleString()}</div>
                                    </td>
                                    {dr.columns.map((kv: PatientListDetailEncounterKeyValue) => {
                                        return (
                                            <td key={kv.key} className={`${c}-column`}>
                                                <div className={`${c}-column-name`}>{kv.key}</div>
                                                <div className={`${c}-column-value`}>{`${this.renderValue(kv.value)}`}</div>
                                            </td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }

    private renderValue = (v: any) => v instanceof Date ? v.toLocaleString() : v;
}