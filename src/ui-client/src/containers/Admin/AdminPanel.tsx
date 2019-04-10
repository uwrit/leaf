/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { ConceptEditor } from '../../components/Admin/ConceptEditor/ConceptEditor';
import AdminState from '../../models/state/AdminState';
import { AppState } from '../../models/state/AppState';

interface StateProps { 
    admin?: AdminState;
}
interface DispatchProps {
    dispatch: any;
}
interface OwnProps {

}
type Props = StateProps & DispatchProps & OwnProps;

interface AdminTab {
    id: number;
    display: string;
    render: (admin: AdminState, dispatch: any) => any;
}

const selectable: AdminTab[] = [
    {
        id: 1,
        display: "Concepts",
        render: (admin: AdminState, dispatch: any) => (
            <ConceptEditor data={admin} dispatch={dispatch}/>
        )
    }
];

class AdminPanel extends React.PureComponent<Props> {
    private className = "admin-panel"
    constructor(props: Props) {
        super(props);
    }

    public render() {
        const { admin, dispatch } = this.props;
        if (!admin) { return null; }

        const content = selectable.find((s) => s.id === admin.activeTab)!.render(admin, dispatch)
        return (
            <div>
                {content}
          </div>
        )
    }
}

const mapStateToProps = (state: AppState): StateProps => {
    return {
        admin: state.admin
    };
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminPanel);
