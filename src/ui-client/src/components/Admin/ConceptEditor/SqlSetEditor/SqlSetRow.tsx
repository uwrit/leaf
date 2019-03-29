/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row, Col } from 'reactstrap';
import { Checkbox } from '../Sections/Checkbox';
import { TextArea } from '../Sections/TextArea';
import { ConceptSqlSet, SpecializationGroup } from '../../../../models/admin/Concept';
import { Collapse } from 'reactstrap';
import { FaChevronDown } from 'react-icons/fa';
import { SpecializationGroupDropdownPreview } from './SpecializationGroupDropdownPreview';
import AdminState, { AdminPanelQueuedApiEvent, AdminPanelUpdateObjectType } from '../../../../models/state/AdminState';
import { setAdminConceptSpecializationGroup } from '../../../../actions/admin/specializationGroup';
import { setAdminConceptSqlSet, saveOrUpdateAdminConceptSqlSet, upsertAdminApiQueuedEvent } from '../../../../actions/admin/sqlSet';

interface Props {
    changeHandler: (val: any, propName: string) => any;
    dispatch: any;
    set: ConceptSqlSet;
    state: AdminState;
}

interface State {
    isOpen: boolean;
}

export class SqlSetRow extends React.PureComponent<Props,State> {
    private className = 'sqlset-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false
        }
    }

    public getSnapshotBeforeUpdate(prevProps: Props) {
        if (this.props.set.specializationGroups.size === 0) {
            this.setState({ isOpen: false });
        }
        return null;
    }

    public componentDidUpdate() {}

    public render() {
        const { changeHandler, set } = this.props;
        const c = this.className;
        const spcGrps: SpecializationGroup[] = [];
        set.specializationGroups.forEach((g) => spcGrps.push(g));

        return (
            <div className={`${c}-table-row-container`}>
                <Row className={`${c}-table-row`}>
                    <Col md={1} className={`${c}-table-row-id`}>
                        <div>{set.id}</div>
                    </Col>
                    <Col md={2} className={`${c}-input-container-checkbox`}>
                        <Checkbox changeHandler={this.handleSqlSetEdit} propName={'isEncounterBased'} value={set.isEncounterBased}/>
                    </Col>
                    <Col md={5} className={`${c}-input-container`}>
                        <TextArea changeHandler={this.handleSqlSetEdit} propName={'sqlSetFrom'} value={set.sqlSetFrom} />
                    </Col>
                    <Col md={4} className={`${c}-input-container`}>
                        <TextArea changeHandler={this.handleSqlSetEdit} propName={'sqlFieldDate'} value={set.sqlFieldDate} />
                    </Col>
                </Row>

                <Col md={12}>
                    {this.renderSpecializationData(spcGrps)}
                </Col>
            </div>
        );
    }

    /*
     * Create a queued event to upsert a Sql Set on save.
     */
    private generateQueuedApiEvent = (set: ConceptSqlSet): AdminPanelQueuedApiEvent => {
        const { dispatch } = this.props;
        return {
            event: () => { dispatch(saveOrUpdateAdminConceptSqlSet(set)) },
            id: set.id,
            objectType: AdminPanelUpdateObjectType.SQL_SET
        };
    }

    /*
     * Handle any edits to a Sql Set, updating 
     * the store and preparing a later API save event.
     */
    private handleSqlSetEdit = (val: any, propName: string) => {
        const { set, dispatch } = this.props;
        const newSet = Object.assign({}, set, { [propName]: val });
        const apiSaveEvent = this.generateQueuedApiEvent(newSet);

        dispatch(upsertAdminApiQueuedEvent(apiSaveEvent));
        dispatch(setAdminConceptSqlSet(newSet));
    }

    /*
     * Render Specialization dropdowns specific to this set.
     */
    private renderSpecializationData = (spcGrps: SpecializationGroup[]) => {
        const { changeHandler, dispatch, set, state } = this.props;
        const { isOpen } = this.state;
        const c = this.className;

        if (set.specializationGroups.size) {
            const emphTextClass = `${c}-text-emphasis`
            let toggleClasses = [ `${c}-dropdown-toggle` ];
            let toggleText = `Show Dropdowns (${set.specializationGroups.size} total)`;
            if (isOpen) {
                toggleClasses.push('open');
                toggleText = 'Hide Dropdowns';
            }

            return (
                [
                    <div className={toggleClasses.join(' ')} onClick={this.handleDropdownToggleClick} key={1}>
                        <span>{toggleText}</span>
                        <FaChevronDown />
                    </div>,
                    <Collapse key={2} isOpen={isOpen} className={`${c}-subtable-collapse`}>
                        {/*
                        <div className={`${c}-text`}>
                            <p>
                                <strong><span className={emphTextClass}>Concept Specialization Dropdowns</span></strong> are additional 
                                pieces of information that can optionally be appended to an existing concept for greater specificity, such 
                                as specifying that a Concept for a given diagnosis code be limited to <strong>only billing diagnoses</strong>,
                                or a Concept for Inpatient Stays be limited to only those <strong>admitted from the ED</strong>.
                            </p>
                            <p>
                                Each dropdown can optionally be assigned to many or no Concepts which use the <strong>same SQL Set as the Concept</strong>.
                                The dropdown will appear as blue text if the user drags a Concept using it into a query, and if a dropdown option is 
                                selected, the dropdown SQL will be appended to the Concept's SQL WHERE clause when the query is run.
                            </p>
                        </div>
                        */}
                        {spcGrps.map((g) => (
                            <SpecializationGroupDropdownPreview 
                                changeHandler={changeHandler} dispatch={dispatch} specializationGroup={g} key={g.id} state={state.specializationGroups}
                            />
                        ))}
                        <div className={`${c}-add-specializationgroup`} onClick={this.handleAddSpecializationGroupDropdownClick}>
                            <span>+Add New Dropdown</span>
                        </div>
                    </Collapse>
                ]
            );
        }
        else {
            return (
                <div className={`${c}-add-specializationgroup`} onClick={this.handleAddSpecializationGroupDropdownClick}>
                    <span>+Add New Dropdown</span>
                </div>
            )
        }
    }

    private generateRandomIntegerId = () => {
        const min = 1;
        const max = 100000;
        return Math.ceil(Math.random() * (max - min) + min);
    }

    private handleAddSpecializationGroupDropdownClick = () => {
        const { set, dispatch } = this.props;
        const grp: SpecializationGroup = {
            id: this.generateRandomIntegerId(),
            sqlSetId: set.id,
            specializations: new Map(),
            uiDefaultText: '',
            unsaved: true
        }
        dispatch(setAdminConceptSpecializationGroup(grp));
        this.setState({ isOpen: true });
    }

    private handleDropdownToggleClick = () => {
        this.setState({ isOpen: !this.state.isOpen })
    }
};
