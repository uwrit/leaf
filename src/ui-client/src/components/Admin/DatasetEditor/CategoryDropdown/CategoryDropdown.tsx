/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu, FormGroup } from 'reactstrap';
import { FaChevronDown } from 'react-icons/fa';
import Label from 'reactstrap/lib/Label';
import { ConfirmationModalState } from '../../../../models/state/GeneralUiState';
import { showConfirmationModal } from '../../../../actions/generalUi';
import { DatasetQueryCategory } from '../../../../models/admin/Dataset';
import { TextArea } from '../../ConceptEditor/Sections/TextArea';
import { saveAdminDatasetQueryCategory, removeAdminDatasetQueryCategory, undoAdminDatasetQueryCategoryChange, setAdminUneditedDatasetQueryCategory, deleteAdminDatasetQueryCategory, setAdminDatasetQueryCategory } from '../../../../actions/admin/datasetQueryCategory';
import FormText from 'reactstrap/lib/FormText';

interface Props {
    currentCategory?: DatasetQueryCategory;
    changeHandler: (val: any, propName: string) => any;
    dispatch: any;
    categories: Map<number,DatasetQueryCategory>;
}

interface State {
    editId?: number;
    isOpen: boolean;
}

export class DatasetQueryCategoryDropdown extends React.PureComponent<Props,State> {
    private className = 'dataset-editor';
    private propName = 'categoryId';
    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false
        }
    }

    public render() {
        const { currentCategory, categories } = this.props;
        const { editId, isOpen } = this.state;
        const c = this.className;
        const display = currentCategory ? currentCategory.category : 'None';
        let cats: DatasetQueryCategory[] = [];
        categories.forEach((c) => cats.push(c));
        cats = cats.sort((a,b) => a.id > b.id ? 1 : -1);

        return (
            <FormGroup>
                <Label>Category</Label>
                <FormText color="muted">Domain or data type</FormText>
                <div className={`concept-editor-dropdown ${c}-dataset-query-category-dropdown`}>
                    <Dropdown isOpen={isOpen} toggle={this.toggle}>
                        <DropdownToggle>
                            {display}
                            <FaChevronDown className={`concept-editor-dropdown-chevron`}/>
                        </DropdownToggle>
                        <DropdownMenu>

                            {/* None */}
                            <DropdownItem>
                                <div className={`${c}-dataset-query-category`} onClick={this.handleNoneDropdownItemClick}>None</div>
                            </DropdownItem>

                            {/* Event Types */}
                            {cats.length > 0 && <DropdownItem divider={true}/>} 
                            {cats.map((cat) => {
                                if (cat.id === editId) { return (
                                    <div className={`${c}-dataset-query-category-edit-container`} key={cat.id}>
                                        <TextArea 
                                            propName='category' changeHandler={this.handleEdit} onClick={this.handleEditingItemClick} 
                                            value={cat.category}
                                        />
                                        <span className={`${c}-dataset-query-category-edit-done`} onClick={this.handleEditDoneClick}>Done</span>
                                        <span className={`${c}-dataset-query-category-edit-undo`} onClick={this.handleEditUndoClick}>Undo</span>
                                    </div>
                                )}
                                return (
                                <DropdownItem key={cat.id} onClick={this.handleDropdownItemClick.bind(null, cat)}>
                                    <div className={`${c}-dataset-query-category`} onClick={this.handleDropdownItemClick.bind(null, cat)}>
                                        {cat.category}
                                        <span className={`${c}-dataset-query-category-edit`} onClick={this.handleEditButtonClick.bind(null, cat)}>Edit</span>
                                        <span className={`${c}-dataset-query-category-delete`} onClick={this.handleDeleteButtonClick.bind(null, cat)}>Delete</span>
                                    </div>
                                </DropdownItem>
                                )}
                            )}
                            <DropdownItem divider={true}/>

                            {/* Add New Category */}
                            <DropdownItem>
                                <div className={`${c}-dataset-query-category`} onClick={this.handleAddNewEventTypeClick}>Add New Category</div>
                            </DropdownItem>
                            
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </FormGroup>
        );
    }

    /*
     * Handles editing blur events, basically toggle closes and 
     * 'Edit' clicks on different Categories while an active edit
     * is already happening.
     */
    private handleEditingBlur = () => {
        const { dispatch, categories } = this.props;
        const { editId } = this.state;
        const current = categories.get(editId!)!;
        const hasText = current.category.trim().length > 0;

        if (hasText) {
            if (current.changed) {
                dispatch(saveAdminDatasetQueryCategory(current));
            }
        } else {
            if (current.unsaved) {
                dispatch(removeAdminDatasetQueryCategory(current));
            } else if (current.changed) {
                dispatch(undoAdminDatasetQueryCategoryChange());
            }
        }
        this.setState({ editId: undefined });
    }

    /*
     * Handles 'done' clicks, which just initiates the 'blur'
     * event flow. This could be removed in favor of just using
     * the blur handler, but is separate in case we need the behavior 
     * to diverge in the future.
     */
    private handleEditDoneClick = () => {
        this.handleEditingBlur();
    }

    /*
     * Handles 'undo' clicks, which fallback to the pre-edit
     * state and removes the Event if not saved on the server.
     */
    private handleEditUndoClick = () => {
        const { dispatch, categories } = this.props;
        const { editId } = this.state;
        const current = categories.get(editId!)!;
        this.setState({ editId: undefined });

        if (current.unsaved) {
            dispatch(removeAdminDatasetQueryCategory(current));
        } else {
            dispatch(undoAdminDatasetQueryCategoryChange());
        }
        this.setState({ editId: undefined });
    }

    /*
     * Makes sure 'Edit' area clicks don't close the dropdown.
     */
    private handleEditingItemClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
    }

    /*
     * Handles 'edit' button clicks to allow editig on a given Category.
     */
    private handleEditButtonClick = (cat: DatasetQueryCategory, e: React.MouseEvent<HTMLElement>) => {
        const { dispatch } = this.props;
        const { editId } = this.state;

        if (editId) {
            this.handleEditingBlur();
        }
        
        e.stopPropagation();
        this.setState({ editId: cat.id, isOpen: true });
        dispatch(setAdminUneditedDatasetQueryCategory(cat));
    }

    /*
     * Handles 'delete' button clicks, checking for confirmation first before deleting.
     */
    private handleDeleteButtonClick = (cat: DatasetQueryCategory, e: React.MouseEvent<HTMLElement>) => {
        const { dispatch } = this.props;
        const confirm: ConfirmationModalState = {
            body: `Are you sure you want to delete the Dataset Query Category, "${cat.category}" (id: ${cat.id})? ` +
                  `This will take effect immediately and can't be undone.`,
            header: 'Delete Dataset Query Category',
            onClickNo: () => null,
            onClickYes: () => dispatch(deleteAdminDatasetQueryCategory(cat)),
            show: true,
            noButtonText: `No`,
            yesButtonText: `Yes, Delete Category`
        };
        e.stopPropagation();
        dispatch(showConfirmationModal(confirm));
    }

    /*
     * Handles edits by cloning and updating the edited object.
     */
    private handleEdit = (val: any, propName: string) => {
        const { dispatch, categories } = this.props;
        const { editId } = this.state;
        const edited = Object.assign({}, categories.get(editId!), { [propName]: val, changed: true });
        dispatch(setAdminDatasetQueryCategory(edited, true));
    }

    /*
     * Toggles the dropdown 'isOpen' state.
     */
    private toggle = () => {
        const { isOpen, editId } = this.state;
        const newOpenState = !isOpen;
        this.setState({ isOpen: newOpenState })

        if (!newOpenState && editId !== undefined) {
            this.handleEditingBlur();
        }
    }

    /*
     * Handles 'None' clicks in the dropdown, which represents
     * 'no cateogory' for a given dataset.
     */
    private handleNoneDropdownItemClick = () => {
        const { changeHandler } = this.props; 
        changeHandler(null, this.propName);
    }

    /*
     * Handles dropdown Category clicks.
     */
    private handleDropdownItemClick = (cat: DatasetQueryCategory) => {
        const { changeHandler } = this.props;
        changeHandler(cat.id, this.propName);
    }

    /*
     * Handles 'Add New Category' clicks by adding a new Category
     * with a dummy id that is replaced on save.
     */
    private handleAddNewEventTypeClick = (e: React.MouseEvent<HTMLElement>) => {
        const { dispatch } = this.props;
        const defaultNewId = -1;
        const newCat: DatasetQueryCategory = {
            changed: true,
            id: defaultNewId,
            category: '',
            unsaved: true
        };
        e.stopPropagation();
        dispatch(setAdminDatasetQueryCategory(newCat, true));
        this.setState({ editId: defaultNewId });
    }
};
