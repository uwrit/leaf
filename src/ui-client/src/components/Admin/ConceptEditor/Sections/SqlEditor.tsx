/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from '../../Section/Section';
import { TextArea } from '../../Section/TextArea';
import { generateSampleSql } from '../../../../utils/admin/concept';
import { setAdminConceptExampleSql } from '../../../../actions/admin/concept';
import { SectionProps } from '../Props';
import { SqlSetDropdown } from './SqlSetDropdown';

interface Props {
    data: SectionProps;
}

export class SqlEditor extends React.PureComponent<Props> {

    public render() {
        const { data } = this.props;
        const { adminConcept, toggleSqlPreview, toggleOverlay, sqlSets, dispatch } = data;
        return (
            <Section header='SQL'>
                <SqlSetDropdown
                    changeHandler={this.handleSqlUpdate} propName={'sqlSetId'} value={adminConcept!.sqlSetId} sqlSets={sqlSets}
                    dispatch={dispatch} focusToggle={toggleSqlPreview} toggleOverlay={toggleOverlay} toggleSqlPreview={toggleSqlPreview} required={true}
                    label='Table, View, or Subquery'
                />
                <TextArea 
                    changeHandler={this.handleSqlUpdate} propName={'sqlSetWhere'} value={adminConcept!.sqlSetWhere}
                    focusToggle={toggleSqlPreview}
                    label='WHERE Clause'
                />
                <TextArea 
                    changeHandler={this.handleSqlUpdate} propName={'sqlFieldNumeric'} value={adminConcept!.sqlFieldNumeric} 
                    focusToggle={toggleSqlPreview}
                    label='Numeric Field or expression' subLabel='Used if filtered by a number'
                />
            </Section>
        );
    }

    private handleSqlUpdate = (val: any, propName: string) => {
        const { changeHandler, adminConcept, sqlSets, sqlConfig, dispatch } = this.props.data;
        changeHandler(val, propName);

        if (adminConcept) {
            const cpt = Object.assign({}, adminConcept, { [propName]: val });
            const sql = generateSampleSql(cpt, sqlSets.get(cpt.sqlSetId!)!, sqlConfig);
            dispatch(setAdminConceptExampleSql(sql));
        }
    }
};
