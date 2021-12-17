/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from '../../Section/Section';
import { AdminPanelPatientListColumnTemplate, PatientListColumnType } from '../../../../models/patientList/Column';
import { SqlBox } from '../../../Other/SqlBox/SqlBox';
import { AdminDatasetQuery } from '../../../../models/admin/Dataset';
import formatSql from '../../../../utils/formatSql';
import { FiCheck } from 'react-icons/fi';
import { setAdminDatasetSql } from '../../../../actions/admin/dataset';
import { PatientListDatasetShape } from '../../../../models/patientList/Dataset';
import { DynamicSchemaTable } from '../DynamicSchemaTable/DynamicSchemaTable';

interface Props {
    dataset?: AdminDatasetQuery;
    dispatch: any;
    expectedColumns: AdminPanelPatientListColumnTemplate[];
    handleInputChange: (val: any, propName: string) => any;
}

export class SqlEditor extends React.PureComponent<Props> {
    private className = 'dataset-editor';

    public render() {
        const { dataset } = this.props;
        const sql = dataset ? dataset.sqlStatement : '';
        const width = this.getSqlWidth();
        const c = this.className;

        return (
            <Section header='SQL'>
                <div className={`${c}-sql-container`}>
                    {this.getColumnContainer()}
                    <div className={`${c}-sql`}>
                        <div className={`${c}-title`}>SQL Query</div>
                        <SqlBox sql={sql} height={360} width={width} readonly={false} changeHandler={this.handleSqlChange}/>
                        <div className={`${c}-sql-autoformat`} onClick={this.handleAutoFormatClick}>Auto-format</div>
                    </div>
                </div>
            </Section>
        );
    }

    /*
     * Returns the React components for SQL column checking
     * depending on whether the dataset is Dynamic or FHIR-based.
     */
    private getColumnContainer = () => {
        const { expectedColumns, dataset, handleInputChange } = this.props;
        const c = this.className;

        /*
         * Dynamic.
         */
        if (dataset && dataset.shape === PatientListDatasetShape.Dynamic) {
            return (
                <div className={`${c}-dynamic-column-container`}>
                    <div className={`${c}-title`}>Expected Columns</div>
                    <DynamicSchemaTable schema={dataset.schema} inputChangeHandler={handleInputChange} />
                </div>
            );
        }

        /* 
         * FHIR templated-shape.
         */
        return (
            <div className={`${c}-column-container`}>
                <div className={`${c}-title`}>Expected Columns</div>
                {expectedColumns.map((col) => this.getColumnContent(col))}
            </div>
        );
    }

    /*
     * Handle clicks to the 'Auto-format' button, which pretty prints SQL.
     */
    private handleAutoFormatClick = () => {
        const { dataset, dispatch } = this.props;
        if (dataset) {
            const pretty = formatSql(dataset.sqlStatement);
            dispatch(setAdminDatasetSql(pretty));
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
        const c = this.className;
        const classes = [ `${c}-column` ];

        if (col.optional) { classes.push('optional'); }
        if (col.present)  { classes.push('present'); }
        return (
            <div key={col.id} className={classes.join(' ')}>
                <FiCheck />
                <span className={`${c}-column-name`}>{col.id}</span>
                <span className={`${c}-column-type`}>{PatientListColumnType[col.type]}</span>
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
