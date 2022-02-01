/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Dropdown, DropdownMenu, DropdownToggle, Input } from 'reactstrap';
import { connect } from 'react-redux';
import { setAdminHelpPage, setCurrentAdminHelpPage, isAdminHelpPageNew, isAdminHelpPageUnsaved } from '../../actions/admin/helpPage';
import { exampleText }  from '../../components/Admin/HelpEditor/ExampleText';
import { Categories } from '../../components/Admin/HelpEditor/Categories/Categories';
import { HelpEditor } from '../../components/Admin/HelpEditor/HelpEditor';
import { HelpSearch } from '../../components/Help/Search/HelpSearch';
import { AdminHelpPage, AdminHelpPageCategory, AdminHelpPageContent } from '../../models/admin/Help';
import { AdminHelpPageLoadState, AdminHelpPageState } from '../../models/state/AdminState';
import { AppState } from '../../models/state/AppState';
import { generate as generateId } from 'shortid';
import './AdminHelp.css';

interface OwnProps { }

interface StateProps {
    adminHelp: AdminHelpPageState;
}

interface DispatchProps {
    dispatch: any;
}

interface State {
    category: string;
    show: boolean;
    title: string;
}

type Props = StateProps & OwnProps & DispatchProps;

export class AdminHelp extends React.PureComponent<Props, State> {
    private className = "admin-help";

    constructor(props: Props) {
        super(props);   
        this.state = {
            category: '',
            show: false,
            title: ''
        }
    };

    public render() {
        const c = this.className;
        const { dispatch, adminHelp } = this.props;
        const { show, category, title } = this.state;
        const categories = [ ...adminHelp.categories.values() ];
        
        if (adminHelp.page.contentState === AdminHelpPageLoadState.LOADED) {
            return (
                <HelpEditor
                    categories={categories}
                    currentPage={adminHelp.currentPage}
                    isNew={adminHelp.isNew}
                    page={adminHelp.page}
                    unsaved={adminHelp.unsaved}
                    dispatch={dispatch}
                />
            );
        };

        return (
            <div className={c}>
                <div className={`${c}-display`}>
                    <div>
                        <Dropdown className={`${c}-create-dropdown-container`} isOpen={show} toggle={this.handleShow}>
                            <DropdownToggle caret className="leaf-button-addnew">
                                New Help Page
                            </DropdownToggle>
                            <DropdownMenu right>
                                <div className={`${c}-create-button-item`}>
                                    Title <Input name='title' value={title} onChange={this.handleChange} />
                                </div>
                                <div className={`${c}-create-button-item`}>
                                    Category <Input name='category' value={category} onChange={this.handleChange} />
                                </div>
                                <div className={`${c}-create-button-item`}>
                                    <Button className="leaf-button-addnew" onClick={this.handleCreateNewPage}>
                                        <span>+ Create</span>
                                    </Button>
                                </div>
                            </DropdownMenu>
                        </Dropdown>
                    </div>

                    <HelpSearch />
                    
                    {(adminHelp.helpState === AdminHelpPageLoadState.LOADED) &&
                        <Categories
                            categoryMap={adminHelp.categories}
                            newCategory={category}
                            newTitle={title}
                            dispatch={dispatch}
                        />
                    }
                </div>
            </div>
        );
    };

    private handleShow = () => {
        this.setState(prevState => ({ category: '', show: !prevState.show, title: '' }));
    };

    private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const key = e.currentTarget.name;
        const val = e.currentTarget.value;
        this.setState({ ...this.state, [ key ]: val });
    };

    private handleCreateNewPage = () => {
        const { dispatch } = this.props;
        const { category, show, title } = this.state;
        const uniqueId = generateId();

        const contentRow = Object.assign({}, {
            id: uniqueId,
            orderId: 0,
            type: 'text',
            textContent: exampleText,
            imageId: '',
            imageContent: '',
            imageSize: 0
        }) as AdminHelpPageContent;

        const newContent = Object.assign({}, {
            id: '',
            title: title ? title : ' Example Title',
            category: { id: '', name: category ? category : 'Example Category' } as AdminHelpPageCategory,
            content: [ contentRow ],
            contentState: AdminHelpPageLoadState.LOADED
        }) as AdminHelpPage;

        dispatch(setCurrentAdminHelpPage(newContent));
        dispatch(setAdminHelpPage(newContent));
        dispatch(isAdminHelpPageNew(true));
        dispatch(isAdminHelpPageUnsaved(true));
        
        // Clear the values so that when user clicks the "go back arrow"
        // from content after clicking "+ Create", category/title are reset.
        this.setState(prevState => ({ category: '', show: !prevState.show, title: '' }));
    };
};

const mapStateToProps = (state: AppState): StateProps => {
    return {
        adminHelp: state.admin!.help
    };
};

const mapDispatchToProps = (dispatch: any): DispatchProps => {
    return { dispatch };
};

export default connect(mapStateToProps, mapDispatchToProps)(AdminHelp)