/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { SavedQueryRef, SavedQueriesState } from '../../models/Query';
import { getSavedQuery, setRunAfterSave, deleteSavedQueryAndCohort } from '../../actions/queries';
import { Panel } from '../../models/panel/Panel';
import { ConfirmationModalState } from '../../models/state/GeneralUiState';
import { showConfirmationModal, toggleSaveQueryPane, hideMyLeafModal, showInfoModal } from '../../actions/generalUi';
import { getPanelItemCount } from '../../utils/panelUtils';
import { CohortStateType } from '../../models/state/CohortState';
import './SavedQueriesTable.css';

interface Props {
    dispatch: any;
    isGateway: boolean;
    queryState: CohortStateType;
    panels: Panel[];
    queries: SavedQueriesState;
}

export default class SavedQueriesTable extends React.PureComponent<Props> {
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { queries, isGateway } = this.props;

        if (!queries.saved.size) { return <div>No saved queries to display</div>; }

        const c = "myleaf-saved-queries";
        const classes = [ `${c}-container` ];
        const saved: SavedQueryRef[] = [ ...queries.saved.values() ];
        const headerClass = `${c}-header`;
        const rowClass = `${c}-row`;
        const openButtonClass = `${c}-open`;
        const delButtonClass = `${c}-delete`;
        let cols = [ "name", "category", "count", "owner", "created", "updated" ];

        if (isGateway) {
            cols = cols.filter((c) => c !== "count");
        }

        return  (
            <div className={classes.join(' ')}>

                {/* Table */}
                <table className={`${c}-table`}>

                    {/* Header */}
                    <thead className={`${c}-header`}>
                        <tr>

                            {/* Columns */}
                            {cols.map((col: string) => <th className={headerClass} key={col}>{col}</th>)}

                            {/* 'Open' and '✖' button columns */}
                            <th />

                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody className={`${c}-body`}>

                        {/* Rows */}
                        {saved.map((s: SavedQueryRef) => {
                            return (
                                (<tr key={s.id} className={rowClass} onDoubleClick={this.handleOpenQueryClick.bind(null, s)}>
                                    {/* Tuples */}
                                    {cols.map((col: any) => {
                                        const val = s[col];
                                        const d: any = val instanceof Date ? val.toLocaleString() : val;
                                        return <td key={`${s.id}_${col}`}>{d}</td>
                                    })}
                                    <td className={openButtonClass} onClick={this.handleOpenQueryClick.bind(null, s)}>Open</td>
                                    <td className={delButtonClass} onClick={this.handleDeleteQueryClick.bind(null, s)}>✖</td>
                                </tr>)
                            );
                        })}
                        
                    </tbody>
                </table>
            </div>
        );
    }

    private handleDeleteQueryClick = (query: SavedQueryRef) => {
        const { dispatch } = this.props;
        const confirm: ConfirmationModalState = {
            body: `Are you sure you want to delete the query "${query.name}"?`,
            header: 'Delete Query',
            onClickNo: () => null,
            onClickYes: () => dispatch(deleteSavedQueryAndCohort(query)),
            show: true,
            noButtonText: 'No',
            yesButtonText: `Yes, delete this query`
        };
        dispatch(showConfirmationModal(confirm));
    }

    private handleOpenQueryClick = (query: SavedQueryRef) => {
        const { queries,  dispatch, panels, queryState } = this.props;
        const confirm: ConfirmationModalState = {
            body: 'Do you want to save the current query?',
            header: 'Save Query',
            onClickNo: () => dispatch(getSavedQuery(query)),
            onClickYes: () => { dispatch(hideMyLeafModal()); setTimeout(() => dispatch(toggleSaveQueryPane()), 500); },
            show: true,
            noButtonText: 'No',
            yesButtonText: `Yes, I'll save first`
        };
        dispatch(setRunAfterSave(() => dispatch(getSavedQuery(query))));

        // Check if query is running
        if (queryState === CohortStateType.REQUESTING) {
            dispatch(showInfoModal({ header: "Query Running", body: "Queries cannot be opened while another is running.", show: true }));
        }
        // Else if there are panel items but query is not saved
        else if (
            getPanelItemCount(panels) > 0 && 
            queryState === CohortStateType.LOADED &&
            !queries.current.id
        ) {
            dispatch(showConfirmationModal(confirm));
        }
        // Else if this is a saved query but definition has changed
        else if (
            queries.current.id &&
            queryState === CohortStateType.LOADED && 
            queries.currentChangeId !== queries.lastSavedChangeId
        ) {
            confirm.body = "Do you want to save changes to your current query?";
            dispatch(showConfirmationModal(confirm));
        }
        else {
            dispatch(setRunAfterSave(null))
            dispatch(getSavedQuery(query));
        }
    }
};