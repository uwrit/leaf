/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { ConceptEditor } from '../../components/Admin/ConceptEditor/ConceptEditor';
import AdminState, { AdminPanelPane } from '../../models/state/AdminState';
import { AppState, DatasetsState } from '../../models/state/AppState';
import { DatasetEditor } from '../../components/Admin/DatasetEditor/DatasetEditor';
import { NetworkAndIdentityEditor } from '../../components/Admin/NetworkAndIdentityEditor/NetworkAndIdentityEditor';
import { SqlSetEditor } from '../../components/Admin/SqlSetEditor/SqlSetEditor';
import './AdminPanel.css';

interface StateProps { 
    admin?: AdminState;
    datasets: DatasetsState;
}
interface DispatchProps {
    dispatch: any;
}
interface OwnProps {

}
type Props = StateProps & DispatchProps & OwnProps;

class AdminPanel extends React.PureComponent<Props> {
    private className = 'admin-panel';

    public render() {
        const { admin } = this.props;
        const c = this.className;

        if (!admin) { return null; }

        return (
            <div className={c}>
                {this.getContent()}
           </div>
        )
    }

    private getContent = () => {
        const { admin, dispatch, datasets } = this.props;

        switch (admin!.activePane) {
            case AdminPanelPane.CONCEPTS:
                return <ConceptEditor data={admin!} dispatch={dispatch} />;
            case AdminPanelPane.SQL_SETS:
                return <SqlSetEditor data={admin!} dispatch={dispatch} />
            case AdminPanelPane.DATASETS:
                return <DatasetEditor data={admin!} dispatch={dispatch} datasets={datasets}/>;
            case AdminPanelPane.NETWORK:
                return <NetworkAndIdentityEditor data={admin!} dispatch={dispatch} />
            default: 
                return null;
        }
    }
}

const mapStateToProps = (state: AppState): StateProps => {
    return {
        admin: state.admin,
        datasets: state.datasets
    };
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        dispatch
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminPanel);
