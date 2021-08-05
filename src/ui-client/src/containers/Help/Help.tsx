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
import { UserContext } from '../../models/Auth';
import { HelpPageState, HelpPageLoadState } from '../../models/state/HelpState';
import { AdminHelp } from '../Admin/AdminHelp';
import './Help.css';
import { AdminHelpState } from '../../models/state/AdminState';

import { HelpPage, HelpPageContent } from '../../models/Help/Help';
import { HelpPageContentTState } from '../../models/state/HelpState';

interface OwnProps { }

interface StateProps {
    helpPages: HelpPageState;
    user: UserContext;
    adminHelp: AdminHelpState;
}

interface DispatchProps {
    dispatch: any;
}

interface State { }

type Props = StateProps & OwnProps & DispatchProps;

export class Help extends React.PureComponent<Props, State> {
    private className = "help-page";

    public render() {
        const c = this.className;
        const { dispatch, helpPages, user, adminHelp } = this.props;
        
        if (adminHelp.state === HelpPageLoadState.LOADED) {
            return (
                <AdminHelp
                    categories={helpPages.categories}
                    // content={helpPages.content.content}
                    currentPage={helpPages.currentSelectedPage}
                    dispatch={dispatch}
                    // adminHelpContent={this.props.adminHelp.helpContent}
                    // page={helpPages.page}
                    page={adminHelp.page}
                    currentCont={adminHelp.currentHelpContent!}
                />
            );
        }

        if (helpPages.content.state === HelpPageLoadState.LOADED) {
            // if (user.isAdmin) {

            //     // this.getAdminContent();
            //     return (
            //         <AdminHelp
            //             categories={helpPages.categories}
            //             // content={helpPages.content.content}
            //             currentPage={helpPages.currentSelectedPage}
            //             dispatch={dispatch}
            //             // adminHelpContent={this.props.adminHelp.helpContent}
            //             page={helpPages.page}
            //         />
            //     );
            // };

            return (
                <div className={`${c}-content`}>
                    <Content
                        content={helpPages.content.content}
                        currentPage={helpPages.currentSelectedPage}
                        dispatch={dispatch}
                    />
                </div>
            );
        };

        return (
            <div className={c}>
                <div className={`${c}-display`}>
                    <HelpSearch />

                    {(helpPages.state === HelpPageLoadState.LOADED) &&
                        <Categories
                            categories={helpPages.categories}
                            dispatch={dispatch}
                            isAdmin={user.isAdmin}
                        />
                    }
                </div>
            </div>
        );
    };
};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        helpPages: state.help,
        user: state.auth.userContext!,
        adminHelp: state.admin!.help
    };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return { dispatch };
};

export default connect(mapStateToProps, mapDispatchToProps)(Help)