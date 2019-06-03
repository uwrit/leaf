/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from '../../Section/Section';
import { AdminPanelPatientListColumnTemplate } from '../../../../models/patientList/Column';
import { SqlBox } from '../../../Other/SqlBox/SqlBox';
import { AdminDatasetQuery } from '../../../../models/admin/Dataset';
import formatSql from '../../../../utils/formatSql';
import { FiCheck } from 'react-icons/fi';
import { setAdminDatasetSql } from '../../../../actions/admin/dataset';

interface Props {
    dataset?: AdminDatasetQuery;
    dispatch: any;
    expectedColumns: AdminPanelPatientListColumnTemplate[];
    handleInputChange: (val: any, propName: string) => any;
}

export class SqlEditor extends React.PureComponent<Props> {
    private className = 'dataset-editor';
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { expectedColumns, dataset } = this.props;
        const c = this.className;
        const width = this.getSqlWidth();
        const sql = dataset ? dataset.sql : '';

        return (
            <Section header='SQL'>
                <div className={`${c}-sql-container`}>
                    <div className={`${c}-column-container`}>
                        {expectedColumns.map((col) => this.getColumnContent(col))}
                    </div>
                    <div className={`${c}-sql`}>
                        <SqlBox sql={sql} height={350} width={width} readonly={false} changeHandler={this.handleSqlChange}/>
                        <div className={`${c}-sql-autoformat`} onClick={this.handleAutoFormatClick}>Auto-format</div>
                    </div>
                </div>
            </Section>
        );
    }

    /*
     * Handle clicks to the 'Auto-format' button, which pretty prints SQL.
     */
    private handleAutoFormatClick = () => {
        const { dataset, handleInputChange } = this.props;
        if (dataset) {
            const pretty = formatSql(dataset.sql);
            handleInputChange(pretty, 'sql');
        }
    }

    /*
     * Compute the width of the SQL container. This is needed because React Ace Editor
     * requires a hard-coded width in order to have predictable size.
     */
    private getSqlWidth = (): number => {
        const max = 800;
        const min = 400;
        const sqlDom = document.getElementsByClassName(`${this.className}-sql`);
        if (sqlDom && sqlDom[0]) {
            const style = window.getComputedStyle(sqlDom[0]);
            if (style) {
                const w = +style.width!.replace('px','');
                const p = +style.paddingLeft!.replace('px','');
                const width = w - (p * 2);
                if (width < min) {
                    return min;
                } else if (width > max) {
                    return max;
                }
                return width;
            }
        }
        return max;
    }

    /*
     * Get React elements depending on whether columns are present, optional, etc.
     */
    private getColumnContent = (col: AdminPanelPatientListColumnTemplate) => {
        const classes = [ `${this.className}-column` ];

        if (col.optional) { classes.push('optional'); }
        if (col.present)  { classes.push('present'); }
        return (
            <div key={col.id} className={classes.join(' ')}>
                <FiCheck />
                <span>{col.id}</span>
            </div>
        );
    }

    /*
     * Handle any direct changes to SQL input.
     */
    private handleSqlChange = (val: any) => {
        const { dispatch } = this.props;
        dispatch(setAdminDatasetSql(val));
    }
};
