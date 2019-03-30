/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Section } from './Section';
import { TextArea } from './TextArea';
import { generateSampleSql } from '../../../../utils/admin';
import { setAdminConceptExampleSql } from '../../../../actions/admin/concept';
import { SectionProps } from '../Props';
import { SqlSetDropdown } from './SqlSetDropdown';

interface Props {
    data: SectionProps;
    handleSave: () => any;
    handleUndoChanges: () => any;
}

export class SqlEditor extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { data, handleSave, handleUndoChanges } = this.props;
        const { concept, toggleSqlPreview, toggleOverlay, sqlSets, dispatch, changed } = data;
        return (
            <Section header='SQL'>
                <SqlSetDropdown
                    changeHandler={this.handleSqlUpdate} propName={'sqlSetId'} value={concept!.sqlSetId} sqlSets={sqlSets}
                    dispatch={dispatch} focusToggle={toggleSqlPreview} toggleOverlay={toggleOverlay} toggleSqlPreview={toggleSqlPreview}
                    handleSave={handleSave} handleUndoChanges={handleUndoChanges} changed={changed}
                    label='Table, View, or Subquery'
                />
                <TextArea 
                    changeHandler={this.handleSqlUpdate} propName={'sqlSetWhere'} value={concept!.sqlSetWhere}
                    focusToggle={toggleSqlPreview}
                    label='WHERE Clause'
                />
                <TextArea 
                    changeHandler={this.handleSqlUpdate} propName={'sqlFieldNumeric'} value={concept!.sqlFieldNumeric} 
                    focusToggle={toggleSqlPreview}
                    label='Numeric Field' subLabel='Used if filtered by a number'
                />
            </Section>
        );
    }

    private handleSqlUpdate = (val: any, propName: string) => {
        const { changeHandler, concept, sqlSets, sqlConfig, dispatch } = this.props.data;
        changeHandler(val, propName);

        if (concept) {
            const cpt = Object.assign({}, concept, { [propName]: val });
            const sql = generateSampleSql(cpt, sqlSets.get(cpt.sqlSetId)!, sqlConfig);
            dispatch(setAdminConceptExampleSql(sql));
        }
    }
};
