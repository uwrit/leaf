/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu, FormGroup } from 'reactstrap';
import { ConceptEvent } from '../../../models/admin/Concept';
import { FaChevronDown } from 'react-icons/fa';
import Label from 'reactstrap/lib/Label';
import { setAdminConceptEvent, saveAdminConceptEvent, deleteAdminConceptEvent, removeAdminConceptEvent, setAdminUneditedConceptEvent, undoAdminConceptEventChange } from '../../../actions/admin/conceptEvent';
import { TextArea } from '../Section/TextArea';
import { ConfirmationModalState } from '../../../models/state/GeneralUiState';
import { showConfirmationModal } from '../../../actions/generalUi';

interface Props {
    currentType?: ConceptEvent;
    changeHandler: (val: any, propName: string) => any;
    dispatch: any;
    eventTypes: ConceptEvent[];
}

interface State {
    editId?: number;
    isOpen: boolean;
}

export class ConceptEventTypeDropdown extends React.PureComponent<Props,State> {
    private className = 'concept-editor';
    private propName = 'eventId';
    constructor(props: Props) {
        super(props);
        this.state = {
            isOpen: false
        }
    }

    public render() {
        const { currentType, eventTypes } = this.props;
        const { editId, isOpen } = this.state;
        const c = this.className;
        const display = currentType ? currentType.uiDisplayEventName : 'None';

        return (
            <FormGroup>
                <Label>Event Type</Label>
                <div className={`admin-panel-dropdown ${c}-concept-event-dropdown`}>
                    <Dropdown isOpen={isOpen} toggle={this.toggle}>
                        <DropdownToggle>
                            {display}
                            <FaChevronDown className={`admin-panel-dropdown-chevron`}/>
                        </DropdownToggle>
                        <DropdownMenu>

                            {/* None */}
                            <DropdownItem>
                                <div className={`${c}-concept-event`} onClick={this.handleNoneDropdownItemClick}>None</div>
                            </DropdownItem>

                            {/* Event Types */}
                            {eventTypes.length > 0 && <DropdownItem divider={true}/>} 
                            {eventTypes.map((ev) => {
                                if (ev.id === editId) { return (
                                    <div className={`${c}-concept-event-edit-container`} key={ev.id}>
                                        <TextArea 
                                            propName='uiDisplayEventName' changeHandler={this.handleEdit} onClick={this.handleEditingItemClick} 
                                            value={ev.uiDisplayEventName}
                                        />
                                        <span className={`${c}-concept-event-edit-done`} onClick={this.handleEditDoneClick}>Done</span>
                                        <span className={`${c}-concept-event-edit-undo`} onClick={this.handleEditUndoClick}>Undo</span>
                                    </div>
                                )}
                                return (
                                <DropdownItem key={ev.id} >
                                    <div className={`${c}-concept-event`} onClick={this.handleDropdownItemClick.bind(null, ev)}>
                                        {ev.uiDisplayEventName}
                                        <span className={`${c}-concept-event-edit`} onClick={this.handleEditButtonClick.bind(null, ev)}>Edit</span>
                                        <span className={`${c}-concept-event-delete`} onClick={this.handleDeleteButtonClick.bind(null, ev)}>Delete</span>
                                    </div>
                                </DropdownItem>
                                )}
                            )}
                            <DropdownItem divider={true}/>

                            {/* Add New Event Type */}
                            <DropdownItem>
                                <div className={`${c}-concept-event`} onClick={this.handleAddNewEventTypeClick}>Add New Event Type</div>
                            </DropdownItem>
                            
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </FormGroup>
        );
    }

    /*
     * Handles editing blur events, basically toggle closes and 
     * 'Edit' clicks on different Event Types while an active edit
     * is already happening.
     */
    private handleEditingBlur = () => {
        const { dispatch, eventTypes } = this.props;
        const { editId } = this.state;
        const current = eventTypes.find((ev) => ev.id === editId)!;
        const hasText = current.uiDisplayEventName.trim().length > 0;

        if (hasText) {
            if (current.changed) {
                dispatch(saveAdminConceptEvent(current));
            }
        } else {
            if (current.unsaved) {
                dispatch(removeAdminConceptEvent(current));
            } else if (current.changed) {
                dispatch(undoAdminConceptEventChange());
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
        const { dispatch, eventTypes } = this.props;
        const { editId } = this.state;
        const current = eventTypes.find((ev) => ev.id === editId)!;
        this.setState({ editId: undefined });

        if (current.unsaved) {
            dispatch(removeAdminConceptEvent(current));
        } else {
            dispatch(undoAdminConceptEventChange());
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
     * Handles 'edit' button clicks to allow editig on a given Event type.
     */
    private handleEditButtonClick = (ev: ConceptEvent, e: React.MouseEvent<HTMLElement>) => {
        const { dispatch } = this.props;
        const { editId } = this.state;

        if (editId) {
            this.handleEditingBlur();
        }
        
        e.stopPropagation();
        this.setState({ editId: ev.id, isOpen: true });
        dispatch(setAdminUneditedConceptEvent(ev));
    }

    /*
     * Handles 'delete' button clicks, checking for confirmation first before deleting.
     */
    private handleDeleteButtonClick = (ev: ConceptEvent, e: React.MouseEvent<HTMLElement>) => {
        const { dispatch } = this.props;
        const confirm: ConfirmationModalState = {
            body: `Are you sure you want to delete the Concept Event, "${ev.uiDisplayEventName}" (id: ${ev.id})? ` +
                  `This will take effect immediately and can't be undone.`,
            header: 'Delete Concept',
            onClickNo: () => null,
            onClickYes: () => dispatch(deleteAdminConceptEvent(ev)),
            show: true,
            noButtonText: `No`,
            yesButtonText: `Yes, Delete Concept`
        };
        e.stopPropagation();
        dispatch(showConfirmationModal(confirm));
    }

    /*
     * Handles edits by cloning and updating the edited object.
     */
    private handleEdit = (val: any, propName: string) => {
        const { dispatch, eventTypes } = this.props;
        const { editId } = this.state;
        const edited = Object.assign({}, eventTypes.find((ev) => ev.id === editId), { [propName]: val, changed: true });
        dispatch(setAdminConceptEvent(edited, true));
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
     * Handles 'None' clicks in the dropdown, which represent
     * 'no event type' for a given SQL set.
     */
    private handleNoneDropdownItemClick = () => {
        const { changeHandler } = this.props; 
        changeHandler(null, this.propName);
    }

    /*
     * Handles dropdown Event Type clicks, updating the Event Type
     * for a given SQL set.
     */
    private handleDropdownItemClick = (ev: ConceptEvent) => {
        const { changeHandler } = this.props;
        changeHandler(ev.id, this.propName);
    }

    /*
     * Handles 'Add New Event Type ' clicks by adding a new Event Type 
     * with a dummy id that is replaced on save.
     */
    private handleAddNewEventTypeClick = (e: React.MouseEvent<HTMLElement>) => {
        const { dispatch } = this.props;
        const defaultNewId = -1;
        const newEv: ConceptEvent = {
            changed: true,
            id: defaultNewId,
            uiDisplayEventName: '',
            unsaved: true
        };
        e.stopPropagation();
        dispatch(setAdminConceptEvent(newEv, true));
        this.setState({ editId: defaultNewId });
    }
};
