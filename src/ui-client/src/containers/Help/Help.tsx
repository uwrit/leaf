/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux';
import { Content } from '../../components/Help/Content/Content';
import { Categories } from '../../components/Help/Categories/Categories';
import { HelpSearch } from '../../components/Help/Search/HelpSearch';
import { AppState } from '../../models/state/AppState';
import { HelpPageState, HelpPageLoadState } from '../../models/state/HelpState';
import './Help.css';

interface OwnProps { }

interface StateProps {
    help: HelpPageState;
}

interface DispatchProps {
    dispatch: any;
}

type Props = StateProps & OwnProps & DispatchProps;

export class Help extends React.PureComponent<Props> {
    private className = "help-page";

    public render() {
        const c = this.className;
        const { dispatch, help } = this.props;
        const categories = [ ...help.categories.values() ];

        if (help.page.contentState === HelpPageLoadState.LOADED) {
            return (
                <div className={`${c}-content`}>
                    <Content
                        dispatch={dispatch}
                        page={help.page}
                    />
                </div>
            );
        };

        return (
            <div className={c}>
                <div className={`${c}-display`}>
                    <HelpSearch />
                    
                    {(help.state === HelpPageLoadState.LOADED) &&
                        <Categories
                            categories={categories}
                            dispatch={dispatch}
                        />
                    }
                </div>
            </div>
        );
    };
};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        help: state.help
    };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return { dispatch };
};

export default connect(mapStateToProps, mapDispatchToProps)(Help)