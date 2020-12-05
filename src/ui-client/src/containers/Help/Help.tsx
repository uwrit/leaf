/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { Pages } from '../../components/Help/Pages';
import { AppState } from '../../models/state/AppState';
import { HelpPagesState } from '../../models/state/HelpState';

interface OwnProps { }

interface StateProps {
    helpPages: HelpPagesState;
}

interface DispatchProps {
    dispatch: any;
}

type Props = StateProps & OwnProps & DispatchProps;

export class Help extends React.PureComponent<Props> {

    public render() {
        const { dispatch, helpPages } = this.props;

        return (
            <Pages dispatch={dispatch} data={helpPages} />
        );
    };
};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        helpPages: state.help
    };
}

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return { dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(Help)