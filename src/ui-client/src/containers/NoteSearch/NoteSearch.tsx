/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { connect } from 'react-redux';
import React from 'react';
import { NoteSearchHeader } from '../../components/NoteSearch/NoteSearchHeader/NoteSearchHeader';
import { AppState, DatasetsState } from '../../models/state/AppState';
import { CohortState } from '../../models/state/CohortState';
import { NoteSearchResults } from '../../components/NoteSearch/NoteSearchResults/NoteSearchResults';
import { NetworkResponderMap } from '../../models/NetworkResponder';
import './NoteSearch.css';

interface StateProps {
    cohort: CohortState;
    datasets: DatasetsState;
    responders: NetworkResponderMap;
}

interface DispatchProps { 
    dispatch: any;
}

interface OwnProps { }

type Props = StateProps & DispatchProps & OwnProps;

class NoteSearch extends React.PureComponent<Props> {
    private className = 'note-search';

    public render() {
        const { dispatch, cohort } = this.props;
        const c = this.className;

        return (
            <div className={`${c} scrollable-offset-by-header`}>

                {/* Header */}
                <NoteSearchHeader {...this.props} />

                {/* Highlighted notes */}
                <NoteSearchResults dispatch={dispatch} noteSearch={cohort.noteSearch} />
                
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => {
    return {
        cohort: state.cohort,
        datasets: state.datasets,
        responders: state.responders
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    };
};

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(NoteSearch);
