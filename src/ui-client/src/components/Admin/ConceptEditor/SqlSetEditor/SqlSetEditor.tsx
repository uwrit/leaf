/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { ConceptSqlSet, SpecializationGroup, Specialization } from '../../../../models/admin/Concept';
import { Button, Container, Row, Col } from 'reactstrap';
import { setAdminPanelConceptEditorPane, setAdminConceptExampleSql } from '../../../../actions/admin/concept';
import { AdminPanelConceptEditorPane } from '../../../../models/state/AdminState';
import { setAdminConceptSqlSet, setAdminUnsavedConceptSqlSets } from '../../../../actions/admin/sqlSet';
import { EditorPaneProps as Props } from '../Props';
import { generateSampleSql } from '../../../../utils/admin';
import { SqlSetRow } from './SqlSetRow';
import './SqlSetEditor.css';

export class SqlSetEditor extends React.PureComponent<Props> {
    private className = 'sqlset-editor';
    constructor(props: Props) {
        super(props);
    }

    public componentDidMount() {
        const { dispatch, data } = this.props;
        dispatch(setAdminUnsavedConceptSqlSets(data.sqlSets.sets));
    }

    public render() {
        const { data, dispatch } = this.props;
        const c = this.className;
        const sets: ConceptSqlSet[] = [];
        data.sqlSets.sets.forEach((s) => sets.push(s));

        return (
            <div className={`${c}-container`}>
                <div className={`${c}-toprow`}>
                    <Button className='leaf-button leaf-button-primary' id={`${c}-add-sqlset`}>Create New SQL Set</Button>
                    <Button className='leaf-button leaf-button-secondary mr-auto' disabled={data.sqlSets.changed} onClick={this.handleUndoChangesClick}>Undo Changes</Button>
                    <Button className='leaf-button leaf-button-primary' disabled={data.sqlSets.changed} onClick={this.handleSaveChangesClick}>Save</Button>
                    <Button className='leaf-button leaf-button-primary back-to-editor' onClick={this.handleBackToConceptEditorClick}>Back to Concept Editor</Button>
                </div>
                <Container className={`${c}-table`}>
                    <Row className={`${c}-table-header`}>
                        <Col md={1}>Id</Col>
                        <Col md={2}>Is Longitudinal</Col>
                        <Col md={5}>SQL FROM</Col>
                        <Col md={4}>SQL Date Field</Col>
                    </Row>
                    {sets.map((s) => <SqlSetRow changeHandler={this.handleSqlSetChange(s)} set={s} dispatch={dispatch} key={s.id} state={data} />)}
                </Container>
            </div>
        );
    }

    private handleSqlSetChange = (set: ConceptSqlSet) => {
        return (val: any, propName: string) => {
            const { data, dispatch } = this.props;
            const { concepts, sqlSets, configuration } = data;
            const newSet = Object.assign({}, sqlSets.sets.get(set.id), { [propName]: val });
            const sql = generateSampleSql(concepts.currentConcept!, newSet, configuration.sql);
    
            dispatch(setAdminConceptSqlSet(newSet));
            dispatch(setAdminConceptExampleSql(sql));
        }
    }

    private handleUndoChangesClick = () => {

    }

    private handleSaveChangesClick = () => {

    }

    private handleBackToConceptEditorClick = () => {
        const { dispatch } = this.props;
        dispatch(setAdminPanelConceptEditorPane(AdminPanelConceptEditorPane.MAIN))
    }
};
