/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { MdCancel, MdSearch, MdStarBorder } from 'react-icons/md';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { cancelQuery, getCounts } from '../../../actions/cohort/count';
import { toggleSaveQueryPane, showInfoModal } from '../../../actions/generalUi';
import { AppState } from '../../../models/state/AppState';
import { Panel as PanelModel } from '../../../models/panel/Panel';
import { PanelFilter as PanelFilterModel } from '../../../models/panel/PanelFilter';
import PanelFilterGroup from '../PanelFilter/PanelFilterGroup';
import { PanelGroup } from './PanelGroup';
import { getPanelItemCount, panelHasErrors } from '../../../utils/panelUtils';
import { InformationModalState } from '../../../models/state/GeneralUiState';
import { CohortStateType } from '../../../models/state/CohortState';

interface StateProps {
    panelFilters: PanelFilterModel[];
    panels: PanelModel[];
    queryState: CohortStateType;
}

interface DispatchProps {
    dispatch: any;
}

interface OwnProps { }

type Props = StateProps & DispatchProps & OwnProps;

class PanelGroupColumn extends React.Component<Props> {
    public handleQueryClick = () => {
        const { queryState, dispatch, panels } = this.props;
        switch (queryState) {
            case CohortStateType.NOT_LOADED: {
                const hasPanelItems = !!getPanelItemCount(panels);
                const hasErrors = panelHasErrors();

                if (hasPanelItems && !hasErrors) {
                    return dispatch(getCounts());
                } else if (!hasPanelItems) {
                    const info : InformationModalState = {
                        header: "No query criteria",
                        body:
                            (<div>
                                <p>It looks like you haven't created a query yet. Drag and drop concepts from the left to create a query, then try again.</p>
                            </div>),
                        show: true
                    }
                    return dispatch(showInfoModal(info));
                } else if (hasErrors) {
                    const info : InformationModalState = {
                        header: "Query error",
                        body: 
                            (<div>
                                <p>It looks like your query has an error. This may be due to trying to filter a Concept by dates or counts that doesn't have any dates (such as demographics).</p>
                                <p>Double-check your query to make sure everything looks okay and try again.</p>
                            </div>),
                        show: true
                    }
                    return dispatch(showInfoModal(info));
                }
                return;
            }
            case CohortStateType.REQUESTING: {
                return dispatch(cancelQuery());
            }
            case CohortStateType.LOADED: {
                return dispatch(toggleSaveQueryPane());
            }
            default: {
                return;
            }
        }
    }

    public setRunQueryButtonContent = () => {
        const { queryState } = this.props;
        const baseClassName = 'find-patients-query-icon';
        switch (queryState) {
            case CohortStateType.NOT_LOADED: {
                return <span><MdSearch className={`${baseClassName} find-patients-runquery-icon`}/>Run Query</span>;
            }
            case CohortStateType.REQUESTING: {
                return <span><MdCancel className={`${baseClassName} find-patients-cancelquery-icon`}/>Cancel Query</span>;
            }
            case CohortStateType.LOADED: {
                return <span><MdStarBorder className={`${baseClassName} find-patients-savequery-icon`}/>Save Query</span>;
            }
            default: 
                return null;
        }
    }

    public render() {
        const { dispatch, panels, panelFilters, queryState } = this.props;
        return (
            <div>
                <div className="find-patients-toprow">
                    <div id="find-patients-runquery" className="leaf-button-main" onMouseUp={this.handleQueryClick}>
                        <span>{this.setRunQueryButtonContent()}</span>
                    </div>
                </div>
                <PanelFilterGroup dispatch={dispatch} filters={panelFilters} />
                <PanelGroup dispatch={dispatch} panels={panels} queryState={queryState} />
            </div>
        );
    }
}

const mapStateToProps = (state: AppState): StateProps => {
    return { 
        panelFilters: state.panelFilters,
        panels: state.panels,
        queryState: state.cohort.count.state
    };
}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PanelGroupColumn);