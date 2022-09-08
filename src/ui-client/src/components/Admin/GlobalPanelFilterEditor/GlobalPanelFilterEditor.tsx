/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button } from 'reactstrap';
import AdminState from '../../../models/state/AdminState';
import { undoAdminGlobalPanelFilterChanges } from '../../../actions/admin/globalPanelFilter';
import { ConfirmationModalState } from '../../../models/state/GeneralUiState';
import { showConfirmationModal } from '../../../actions/generalUi';
import { WhatsThis } from '../../Other/WhatsThis/WhatsThis';
import { GlobalPanelFilter } from '../../../models/admin/GlobalPanelFilter';
import { setAdminGlobalPanelFilter } from '../../../actions/admin/globalPanelFilter';
import { processApiUpdateQueue } from '../../../actions/admin/globalPanelFilter';
import { GlobalPanelFilterRow } from './GlobalPanelFilterRow/GlobalPanelFilterRow';
import './GlobalPanelFilterEditor.css';

interface Props { 
    data: AdminState;
    dispatch: any;
}

interface State {
    forceValidation: boolean;
}

export class GlobalPanelFilterEditor extends React.PureComponent<Props,State> {
    private className = 'global-panelfilter-editor';
    constructor(props: Props) {
        super(props);
        this.state = {
            forceValidation: false
        }
    }

    public render() {
        const { data, dispatch } = this.props;
        const { forceValidation } = this.state;
        const { globalPanelFilters } = data;
        const { changed } = globalPanelFilters;
        const c = this.className;

        return (
            <div className={`${c}-container admin-panel-editor`}>

                {/* Header */}
                <div className={`${c}-toprow`}>
                    <Button className='leaf-button leaf-button-addnew' onClick={this.handleAddNewClick}>
                        + Create New Global Panel Filter
                    </Button>
                    <Button className='leaf-button leaf-button-secondary' disabled={!changed} onClick={this.handleUndoChangesClick}>
                        Undo Changes
                    </Button>
                    <Button className='leaf-button leaf-button-primary' disabled={!changed} onClick={this.handleSaveChangesClick}>
                        Save
                    </Button>

                    {/* Explanation */}
                    <WhatsThis 
                        question={'What is a Global Panel Filter?'}
                        body={`Global Panel Filters are additional logic that are added to users' queries which users have no control over, and can be 
                               applied to users logged in for QI, Research, or in all cases. Global Panel Filters are typically used to exclude patients 
                               who have not consented to having their data used for research (for users in Research mode), or excluding VIPs, etc.`}
                    />
                </div>

                {/* Global Panel Filters */}
                <div className={`${c}-table`}>
                    {[ ...globalPanelFilters.data.values() ]
                        .map(gpf => (
                            <GlobalPanelFilterRow 
                                key={gpf.id}
                                data={data} 
                                dispatch={dispatch} 
                                globalPanelFilter={gpf} 
                                forceValidation={forceValidation} 
                            />)
                        )}
                </div>
            </div>
        );
    }

    /* 
     * Generate the an integer 1 higher than the max
     * of the current.
     */
    private generateSequentialIntegerId = () => {
        const { data } = this.props.data.globalPanelFilters;
        if (!data.size) { return 1; }
        const max = Math.max(...[ ...data.values() ].map((s) => s.id));
        return max + 1;
    }

    private handleAddNewClick = () => {
        const { dispatch, data } = this.props;
        const newPf: GlobalPanelFilter = {
            id: this.generateSequentialIntegerId(),
            isInclusion: true,
            sqlSetId: data.sqlSets.sets.size > 0 
                ? [ ...data.sqlSets.sets.keys() ][0]
                : undefined,
            unsaved: true
        }
        dispatch(setAdminGlobalPanelFilter(newPf, true));
    }

    private handleUndoChangesClick = () => {
        const { dispatch } = this.props;
        this.setState({ forceValidation: false });
        dispatch(undoAdminGlobalPanelFilterChanges());
    }

    /*
     * Handle a save event.
     */
    private handleSaveChangesClick = () => {
        const { dispatch } = this.props;
        const valid = this.currentPanelFiltersAreValid();
        if (valid) {
            dispatch(processApiUpdateQueue());
        } else {
            const confirm: ConfirmationModalState = {
                body: `One or more fields in the Global Panel Filters are missing necessary data. Are you sure you want to save?`,
                header: 'Missing Global Panel Filter data',
                onClickNo: () => null as any,
                onClickYes: () => { 
                    dispatch(processApiUpdateQueue());
                    this.setState({ forceValidation: false });
                },
                show: true,
                noButtonText: `No`,
                yesButtonText: `Yes, Save Global Panel Filters`
            };
            dispatch(showConfirmationModal(confirm));
            this.setState({ forceValidation: true });
        }
    }


    /*
     * Validate that current admin Panel Filter is valid. Called on 'Save' click.
     */
    private currentPanelFiltersAreValid = (): boolean => {
        const { data } = this.props.data.globalPanelFilters;

        for (const pf of [ ...data.values() ]) {
            if (pf.changed || pf.unsaved) {
                if (!pf.sqlSetId) { return false; }
            }
        }
        return true;
    }
}