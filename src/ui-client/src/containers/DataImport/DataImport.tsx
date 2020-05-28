/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import ImportState from '../../models/state/Import';
import { AppState } from '../../models/state/AppState';
import REDCapImportModal from '../../components/DataImport/REDCap/REDCapImportModal';
import { GeneralUiState } from '../../models/state/GeneralUiState';

interface StateProps {
    dataImport: ImportState;
    generalUi: GeneralUiState;
}
interface DispatchProps {
    dispatch: any;
}
interface OwnProps {}

type Props = StateProps & DispatchProps & OwnProps;

class DataImportContainer extends React.PureComponent<Props> {
    public render() {
        const { dataImport, dispatch, generalUi } = this.props;

        return ([
            <REDCapImportModal data={dataImport} dispatch={dispatch} show={generalUi.showImportRedcapModal} key={1} />
        ]);
    }
};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        dataImport: state.dataImport,
        generalUi: state.generalUi
    };
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DataImportContainer);