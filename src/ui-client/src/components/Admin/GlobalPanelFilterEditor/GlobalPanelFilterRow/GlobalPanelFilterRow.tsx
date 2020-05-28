/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Row, Col, Container } from 'reactstrap';
import { Checkbox } from '../../Section/Checkbox';
import { TextArea } from '../../Section/TextArea';
import AdminState from '../../../../models/state/AdminState';
import { ConfirmationModalState } from '../../../../models/state/GeneralUiState';
import { showConfirmationModal } from '../../../../actions/generalUi';
import { GlobalPanelFilter } from '../../../../models/admin/GlobalPanelFilter';
import { SqlSetDropdown } from '../../ConceptEditor/Sections/SqlSetDropdown';
import { setAdminGlobalPanelFilter, deleteAdminGlobalPanelFilter } from '../../../../actions/admin/globalPanelFilter';
import { SessionTypeDropdown } from '../SessionTypeDropdown/SessionTypeDropdown';

interface Props {
    data: AdminState;
    dispatch: any;
    forceValidation: boolean;
    globalPanelFilter: GlobalPanelFilter;
}

export class GlobalPanelFilterRow extends React.PureComponent<Props> {
    private className = 'global-panelfilter-editor';

    public render() {
        const { globalPanelFilter, dispatch, forceValidation, data } = this.props;
        const c = this.className;

        return (
            <div className={`${c}-table-row-container`}>

                {/* Unsaved indicator */}
                {(globalPanelFilter.unsaved || globalPanelFilter.changed) &&
                <span className={`${c}-unsaved`}>unsaved</span>
                }

                {/* Id */}
                {<span className={`${c}-row-id`}>{globalPanelFilter.id}</span>}

                {/* Delete Button */}
                <div className={`${c}-delete`} onClick={this.handleDeleteClick}>Delete</div>

                <Row className={`${c}-table-row`}>

                    {/* SQL Set and WHERE */}
                    <Col md={5} className={`${c}column`}>
                        <SqlSetDropdown
                            changeHandler={this.handleEdit} propName={'sqlSetId'} value={globalPanelFilter!.sqlSetId} sqlSets={data.sqlSets.sets}
                            dispatch={dispatch} required={true} label='Table, View, or Subquery' forceValidation={forceValidation}
                        />
                        <TextArea 
                            changeHandler={this.handleEdit} propName={'sqlSetWhere'} value={globalPanelFilter!.sqlSetWhere} label='WHERE Clause'
                        />
                    </Col>

                    {/* Session Type */}
                    <Col md={4} className={`${c}-column`}>
                        <SessionTypeDropdown changeHandler={this.handleEdit} globalPanelFilter={globalPanelFilter} />
                    </Col>

                    {/* Include or Exclude */}
                    <Col md={3}>
                        <Container>
                            <Checkbox 
                                changeHandler={this.handleEdit} propName={'isInclusion'} value={globalPanelFilter.isInclusion} 
                                label='Is Inclusion'
                            />
                        </Container>
                        <p className={`${c}-subtext`}>
                            If 'true', the global panel filter will be used as part of the inclusion criteria for the query. If 'false', any 
                            patients found will be excluded instead.
                        </p>
                    </Col>
                </Row>
                
            </div>
        );
    }

    /*
     * Handle any edits, updating the store and preparing a later API save event.
     */
    private handleEdit = (val: any, propName: string) => {
        const { globalPanelFilter, dispatch } = this.props;
        const newPf = Object.assign({}, globalPanelFilter, { [propName]: val === '' ? null : val, changed: true });
        dispatch(setAdminGlobalPanelFilter(newPf, true));
    }

    /*
     * Handle delete clicks, removing if not saved, else calling API.
     */
    private handleDeleteClick = () => {
        const { globalPanelFilter, dispatch } = this.props;

        if (globalPanelFilter.unsaved) {
            dispatch(deleteAdminGlobalPanelFilter(globalPanelFilter));
        } else {
            const confirm: ConfirmationModalState = {
                body: `Are you sure you want to delete the Global Panel Filter (id "${globalPanelFilter.id}")? This can't be undone.`,
                header: 'Delete Global Panel Filter',
                onClickNo: () => null,
                onClickYes: () => dispatch(deleteAdminGlobalPanelFilter(globalPanelFilter)),
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, Delete Global Panel Filter`
            };
            dispatch(showConfirmationModal(confirm));
        }
    }
};
