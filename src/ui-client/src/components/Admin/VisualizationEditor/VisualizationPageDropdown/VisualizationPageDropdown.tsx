/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu, FormGroup } from 'reactstrap';
import { FaChevronDown } from 'react-icons/fa';
import Label from 'reactstrap/lib/Label';
import { generate as generateId } from 'shortid';
import { ConfirmationModalState, InformationModalState } from '../../../../models/state/GeneralUiState';
import { showConfirmationModal, showInfoModal } from '../../../../actions/generalUi';
import { DatasetQueryCategory } from '../../../../models/admin/Dataset';
import { TextArea } from '../../Section/TextArea';
import { saveAdminDatasetQueryCategory, removeAdminDatasetQueryCategory, undoAdminDatasetQueryCategoryChange, setAdminUneditedDatasetQueryCategory, deleteAdminDatasetQueryCategory, setAdminDatasetQueryCategory } from '../../../../actions/admin/datasetQueryCategory';
import FormText from 'reactstrap/lib/FormText';
import { AdminVisualizationPage } from '../../../../models/admin/Visualization';
import { removeAdminVisualizationPage, setAdminVisualizationPage } from '../../../../actions/admin/visualization';

interface Props {
    changeHandler: (page: AdminVisualizationPage) => any;
    currentPage?: AdminVisualizationPage;
    dispatch: any;
    pages: Map<string, AdminVisualizationPage>;
    locked?: boolean;
}

interface State {
    isOpen: boolean;
}

export class VisualizationPageDropdown extends React.PureComponent<Props,State> {
    private className = 'dataset-editor';
    private propName = 'categoryId';
    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false
        }
    }

    public render() {
        const { currentPage, pages, locked } = this.props;
        const { isOpen } = this.state;
        const c = this.className;
        const display = currentPage ? currentPage.pageName : 'None';
        let pagesDisplay: AdminVisualizationPage[] = [ ...pages.values() ]
            .sort((a,b) => a.pageName.localeCompare(b.pageName.toLowerCase()));

        return (
            <FormGroup>
                <div className={`admin-panel-dropdown ${c}-dataset-visualization-dropdown`}>
                    <Dropdown isOpen={isOpen} toggle={this.toggle}>
                        <DropdownToggle disabled={locked}>
                            {display}
                            <FaChevronDown className={`admin-panel-dropdown-chevron`}/>
                        </DropdownToggle>
                        <DropdownMenu>

                            {/* Event Types */}
                            {pagesDisplay.length > 0 && <DropdownItem divider={true}/>} 
                            {pagesDisplay.map((page) => {
                                return (
                                    <DropdownItem key={page.id} onClick={this.handleDropdownItemClick.bind(null, page)}>
                                        <div className={`${c}-dataset-visualization-pagename`}>
                                            {page.pageName}
                                            <span className={`${c}-dataset-visualization-delete`} onClick={this.handleDeleteButtonClick.bind(null, page)}>Delete</span>
                                        </div>
                                    </DropdownItem>
                                    )}
                            )}
                            <DropdownItem divider={true}/>

                            {/* Add New Page */}
                            <DropdownItem>
                                <div className={`${c}-dataset-add-visualization-page`} onClick={this.handleAddNewPageTypeClick}>Add New Visualization Page</div>
                            </DropdownItem>
                            
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </FormGroup>
        );
    }

    /*
     * Handle 'delete' button clicks, checking for confirmation first before deleting.
     */
    private handleDeleteButtonClick = (page: AdminVisualizationPage, e: React.MouseEvent<HTMLElement>) => {
        const { dispatch } = this.props;
        const confirm: ConfirmationModalState = {
            body: `Are you sure you want to delete the Visualization Page, "${page.pageName}" (id: ${page.id})? ` +
                  `This will take effect immediately and can't be undone.`,
            header: 'Delete Visualization Page',
            onClickNo: () => null as any,
            onClickYes: () => dispatch(removeAdminVisualizationPage(page)),
            show: true,
            noButtonText: `No`,
            yesButtonText: `Yes, Delete Visualization Page`
        };
        e.stopPropagation();
        dispatch(showConfirmationModal(confirm));
    }

    /*
     * Toggle the dropdown 'isOpen' state.
     */
    private toggle = () => {
        const { isOpen, } = this.state;
        const newOpenState = !isOpen;
        this.setState({ isOpen: newOpenState })
    }

    /*
     * Handle dropdown Category clicks.
     */
    private handleDropdownItemClick = (page: AdminVisualizationPage) => {
        const { changeHandler } = this.props;
        changeHandler(page);
    }

    /*
     * Handle 'Add New Category' clicks by adding a new Category
     * with a dummy id that is replaced on save.
     */
    private handleAddNewPageTypeClick = (e: React.MouseEvent<HTMLElement>) => {
        const { dispatch } = this.props;
        const newPage: AdminVisualizationPage = {
            id: generateId(),
            category: '',
            components: [],
            constraints: [],
            orderId: 0,
            pageName: 'New Visualization',
            pageDescription: '',
            unsaved: true
        };
        e.stopPropagation();
        dispatch(setAdminVisualizationPage(newPage));
    }
};
