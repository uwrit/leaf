/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { UserInquiryState, UserInquiryType } from '../../models/state/GeneralUiState';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, FormGroup, Label, FormText, Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { setUserQuestionState } from '../../actions/generalUi';
import { FaChevronDown } from 'react-icons/fa';
import { SavedQueryMap, SavedQueryRef } from '../../models/Query';
import './UserQuestionModal.css';

interface Props {
    dispatch: any;
    queries: SavedQueryMap;
    state: UserInquiryState;
}

interface State {
    dropdownOpen: boolean;
}

export default class UserQuestionModal extends React.PureComponent<Props,State> {
    private className = 'user-question-modal';

    public constructor(props: Props) {
        super(props);
        this.state = {
            dropdownOpen: false
        }
    }

    public render() {
        const c = this.className;
        const { associatedQuery, email, show, type, text } = this.props.state;
        const { dropdownOpen } = this.state;
        const questionText = 
`Examples:
  - How many patients had an Ejection Fraction below 40% with ACS presention in the past year? 
  - I want to find blood pressure data for ED patients presenting with myocardial infarction twice in the past 6 months.
  - How many patients 
      1) Were seen at the Adult Medicine Clinic and in the same encounter had a BMI over 35 in the past 5 years
      2) Are aged 65 or older`

        return (
            <Modal isOpen={show} className={`${c} leaf-modal`} keyboard={true} size={'lg'}>

                {/* Header */}
                <ModalHeader>
                    Ask a Question <span className={`${c}-close`} onClick={this.handleCloseClick}>✖</span>
                </ModalHeader>

                {/* Body */}
                <ModalBody>
                    <Row>
                        <Col md={6}>

                            {/* Email */}
                            <div className={`${c}-section`}>
                                <FormGroup>
                                    <Label>
                                        Email
                                        <span className='required'>*</span>
                                        <FormText color="muted">Let us know the best email address to respond to.</FormText>
                                    </Label>
                                    <Input
                                        className={'leaf-input'}
                                        onChange={this.handleEmailChange}
                                        placeholder={'Enter a valid email address'}
                                        readOnly={false}
                                        spellCheck={false}
                                        type={'email'}
                                        value={email} />
                                </FormGroup>
                            </div>

                        </Col>
                        <Col md={6}>

                            {/* Associated Query */}
                            <div className={`${c}-section`}>
                                <FormGroup>
                                    <Label>
                                        Related Leaf Query
                                        <FormText color="muted">Have you already tried a query in Leaf? Let us know which one.</FormText>
                                    </Label>
                                    <div className={`${c}-dropdown`} tabIndex={0}>
                                        <Dropdown isOpen={dropdownOpen} toggle={this.toggleDropdown} >
                                            <DropdownToggle>
                                                <div>
                                                    {associatedQuery ? associatedQuery.name : "I don't have a query yet"} 
                                                    <FaChevronDown className={`${c}-dropdown-chevron`}/>
                                                </div>
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                <div className={`${c}-dropdown-item-container`}>
                                                <DropdownItem>
                                                    I don't have a query yet                                        
                                                </DropdownItem>
                                                <DropdownItem divider={true} />
                                                {[ ...this.props.queries.values() ].map((q) => {
                                                    return (
                                                        <DropdownItem 
                                                            key={q.id}>
                                                            {q.name}
                                                        </DropdownItem>
                                                    );
                                                })}
                                                </div>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                </FormGroup>
                            </div>

                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>

                            {/* Inquiry Type */}
                            <div className={`${c}-section`}>
                                <FormGroup tag="fieldset" className={`${c}-type`}>
                                    <Label>
                                        What would you like help with?<span className='required'>*</span>
                                    </Label>
                                    <FormGroup check>
                                        <Label check>
                                            <Input
                                                type="radio" name="need-help" 
                                                onClick={this.handleTypeChange.bind(null, UserInquiryType.HelpMakingQuery)} 
                                                checked={type === UserInquiryType.HelpMakingQuery} 
                                            />
                                            I need help making a query
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                            <Input
                                                type="radio" name="new-data" 
                                                onClick={this.handleTypeChange.bind(null, UserInquiryType.DataRequest)} 
                                                checked={type === UserInquiryType.DataRequest} 
                                            />
                                            I'd like to request new data elements
                                        </Label>
                                    </FormGroup>
                                    <FormGroup check>
                                        <Label check>
                                            <Input 
                                                type="radio" name="other" 
                                                onClick={this.handleTypeChange.bind(null, UserInquiryType.Other)} 
                                                checked={type === UserInquiryType.Other} 
                                            />
                                            Other
                                        </Label>
                                    </FormGroup>
                                </FormGroup>
                            </div>

                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>

                            {/* Question or Request */}
                            <div className={`${c}-section`}>
                                <FormGroup className={`${c}-question`}>
                                    <Label>
                                        What is your question?
                                        <span className='required'>*</span>
                                        <FormText color="muted">Please answer clearly <strong>in the form of a question</strong> or stating your data needs.</FormText>
                                    </Label>
                                    <Input
                                        className={'leaf-input'}
                                        onChange={this.handleTextChange}
                                        placeholder={questionText}
                                        readOnly={false}
                                        spellCheck={false}
                                        type={'textarea'}
                                        value={text} />
                                </FormGroup>
                            </div>

                        </Col>
                    </Row>

                </ModalBody>

                {/* Footer */}
                <ModalFooter>
                    <Button className="leaf-button leaf-button-primary" onClick={this.handleCloseClick}>Close</Button>
                </ModalFooter>
            </Modal>
        );
    }

    private handleCloseClick = () => {
        const { dispatch, state } = this.props;
        dispatch(setUserQuestionState({ ...state, show: false }));
    }

    private toggleDropdown = () => {
        this.setState({ dropdownOpen: !this.state.dropdownOpen });
    }

    private handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { dispatch, state } = this.props;
        const newState: UserInquiryState = { ...state, email: e.currentTarget.value };
        dispatch(setUserQuestionState(newState));
    }

    private handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { dispatch, state } = this.props;
        const newState: UserInquiryState = { ...state, text: e.currentTarget.value };
        dispatch(setUserQuestionState(newState));
    }

    private handleAssociatedQueryChange = (associatedQuery: SavedQueryRef) => {
        const { dispatch, state } = this.props;
        const newState: UserInquiryState = { ...state, associatedQuery };
        dispatch(setUserQuestionState(newState));
    }

    private handleTypeChange = (type: UserInquiryType) => {
        const { dispatch, state } = this.props;
        const newState: UserInquiryState = { ...state, type };
        dispatch(setUserQuestionState(newState));
    }
}