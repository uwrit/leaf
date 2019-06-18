/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row, Col, Container } from 'reactstrap';
import { Checkbox } from '../../Section/Checkbox';
import { TextArea } from '../../Section/TextArea';
import { ConceptSqlSet, SpecializationGroup, ConceptEvent } from '../../../../models/admin/Concept';
import { Collapse } from 'reactstrap';
import { FaChevronDown } from 'react-icons/fa';
import { SpecializationGroupDropdownPreview } from '../SpecializationGroupDropdownPreview/SpecializationGroupDropdownPreview';
import AdminState from '../../../../models/state/AdminState';
import { setAdminConceptSpecializationGroup } from '../../../../actions/admin/specializationGroup';
import { setAdminConceptSqlSet, removeAdminConceptSqlSet, deleteAdminConceptSqlSet } from '../../../../actions/admin/sqlSet';
import { ConfirmationModalState, InformationModalState } from '../../../../models/state/GeneralUiState';
import { showConfirmationModal, showInfoModal } from '../../../../actions/generalUi';
import { ConceptEventTypeDropdown } from '../ConceptEventTypeDropdown/ConceptEventTypeDropdown';

interface Props {
    dispatch: any;
    eventTypes: ConceptEvent[];
    forceValidation: boolean;
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
            return false;
        }
        return null;
    }

    public componentDidUpdate(prevProps: Props, prevState: State, snapshot?: boolean) {
        if (snapshot) {
            this.setState({ isOpen: snapshot });
        }
    }

    public render() {
        const { set, eventTypes, dispatch, forceValidation } = this.props;
        const c = this.className;
        const unsaved = set.unsaved || set.changed;
        const currentEventType = set.eventId ? eventTypes.find((ev) => ev.id === set.eventId) : undefined;
        const spcGrps: SpecializationGroup[] = [ ...set.specializationGroups.values() ];

        return (
            <div className={`${c}-table-row-container ${unsaved ? 'unsaved' : ''}`}>

                {/* Unsaved notifier */}
                {unsaved &&
                <span className={`${c}-unsaved`}>unsaved</span>
                }

                {/* Set Id */}
                {<span className={`${c}-row-id`}>{set.id}</span>}

                {/* Delete Concept SQL Set */}
                <div className={`${c}-sqlset-delete`}>
                    <span onClick={this.handleSqlSetDeleteClick}>Delete</span>
                </div>

                <Row className={`${c}-table-row`}>

                    {/* SQL Set */}
                    <Col md={4} className={`${c}-input-column`}>
                        <div className={`${c}-input-container`}>
                            <TextArea 
                                changeHandler={this.handleSqlSetEdit} propName={'sqlSetFrom'} value={set.sqlSetFrom} label='SQL FROM'
                                required={true} errorText='Enter a valid SQL Set' forceValidation={forceValidation}
                            />
                        </div>
                    </Col>

                    {/* SQL Date Field */}
                    <Col md={4} className={`${c}-input-column`}>
                        <div className={`${c}-input-container`}>
                            <Container>
                                <Checkbox changeHandler={this.handleSqlSetEdit} propName={'isEncounterBased'} value={set.isEncounterBased} label='Has Encounters'/>
                            </Container>
                            {set.isEncounterBased &&
                            <TextArea 
                                changeHandler={this.handleSqlSetEdit} propName={'sqlFieldDate'} value={set.sqlFieldDate} 
                                label='Date Field' required={set.isEncounterBased} errorText='Enter a valid SQL Date Field' forceValidation={forceValidation}
                            />
                            }
                        </div>
                    </Col>

                    {/* SQL Event Field */}
                    <Col md={4} className={`${c}-input-column`}>
                        <div className={`${c}-input-container`}>
                            <Container>
                                <Checkbox changeHandler={this.handleSqlSetEdit} propName={'isEventBased'} value={set.isEventBased} label='Joinable by Event'/>
                            </Container>
                            {set.isEventBased &&
                            <div>
                                <TextArea 
                                    changeHandler={this.handleSqlSetEdit} propName={'sqlFieldEvent'} value={set.sqlFieldEvent} label='Event Field'
                                    required={set.isEventBased} errorText='Enter a valid SQL Event Field' forceValidation={forceValidation}
                                />
                                <ConceptEventTypeDropdown 
                                    changeHandler={this.handleSqlSetEdit} eventTypes={eventTypes} currentType={currentEventType} dispatch={dispatch}
                                />
                            </div>
                            }

                        </div>
                    </Col>
                </Row>
                
                {/* Specialization Groups */}
                <div className={`${c}-specializationgroups-container`}>
                    {this.renderSpecializationData(spcGrps)}
                </div>
                
            </div>
        );
    }

    /*
     * Render Specialization dropdowns specific to this set.
     */
    private renderSpecializationData = (spcGrps: SpecializationGroup[]) => {
        const { dispatch, set, forceValidation } = this.props;
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
                        {spcGrps
                            .sort((a,b) => a.id > b.id ? 1 : -1)
                            .map((g) => (
                                <SpecializationGroupDropdownPreview 
                                    changeHandler={this.handleSqlSetEdit} dispatch={dispatch} specializationGroup={g} key={g.id} forceValidation={forceValidation}
                                />
                            ))
                        }
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

    /* 
     * Generate a random ID for a new specialization group.
     */
    private generateSequentialIntegerId = () => {
        const { specializationGroups } = this.props.set;
        if (!specializationGroups.size) { return 1; }
        const max = Math.max.apply(Math, [ ...specializationGroups.values() ].map((s) => s.id)) ;
        return max + 1;
    }

    /*
     * Handle any edits to a Sql Set, updating 
     * the store and preparing a later API save event.
     */
    private handleSqlSetEdit = (val: any, propName: string) => {
        const { set, dispatch } = this.props;
        const newSet = Object.assign({}, set, { [propName]: val === '' ? null : val, changed: true });
        dispatch(setAdminConceptSqlSet(newSet, true));
    }

    /*
     * Handle any edits to a Sql Set, updating 
     * the store and preparing a later API save event.
     */
    private handleSqlSetDeleteClick = () => {
        const { set, dispatch } = this.props;

        if (set.unsaved) {
            dispatch(removeAdminConceptSqlSet(set));
        } else if (set.specializationGroups.size) {
            const info: InformationModalState = {
                body: "This SQL Set has dropdowns which depend on it. Please delete all dependent dropdowns first.",
                header: "Cannot Delete SQL Set",
                show: true
            };
            dispatch(showInfoModal(info));
        } else {
            const confirm: ConfirmationModalState = {
                body: `Are you sure you want to delete the SQL Set (id "${set.id}")? This can't be undone.`,
                header: 'Delete Concept SQL Set',
                onClickNo: () => null,
                onClickYes: () => dispatch(deleteAdminConceptSqlSet(set)),
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, Delete SQL Set`
            };
            dispatch(showConfirmationModal(confirm));
        }
    }

    /*
     * Handle add Specialization Group click.
     */
    private handleAddSpecializationGroupDropdownClick = () => {
        const { set, dispatch } = this.props;
        const grp: SpecializationGroup = {
            id: this.generateSequentialIntegerId(),
            sqlSetId: set.id,
            specializations: new Map(),
            uiDefaultText: '',
            unsaved: true
        }
        dispatch(setAdminConceptSpecializationGroup(grp));
        this.setState({ isOpen: true });
    }

    /*
     * Toggle the dropdown open/closed state.
     */
    private handleDropdownToggleClick = () => {
        this.setState({ isOpen: !this.state.isOpen })
    }
};
