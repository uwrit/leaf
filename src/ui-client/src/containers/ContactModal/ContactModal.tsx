/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, FormGroup, Label, Input, FormText, Row, Col, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { FaChevronDown } from 'react-icons/fa';
import './ContactModal.css';

interface Props { 
    email: string;
    show: boolean;
}

interface State {
    dropdownOpen: boolean;
    question: string;
    userEmail: string;
}

export default class ContactModal extends React.PureComponent<Props,State> {
    private className = 'contact-modal'

    constructor(props: Props) {
        super(props);
        this.state = {
            dropdownOpen: false,
            question: '',
            userEmail: ''
        }
    }

    public render() {
        const { email, show } = this.props;
        const { question, userEmail, dropdownOpen } = this.state;
        const c = this.className;
        const classes = [ c, 'leaf-modal' ];

        return (
            <Modal isOpen={show} className={classes.join(' ')} backdrop={false}>
                <ModalHeader>
                    Contact a Leaf administrator
                    <span className={`${c}-close`} onClick={this.handleCloseClick}>✖</span>
                </ModalHeader>
                <ModalBody>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label>
                                    Email Address
                                    <FormText color="muted">An email address to contact you for reply.</FormText>
                                </Label>
                                <Input 
                                    className="leaf-input"
                                    type="text"
                                    onChange={this.handleUserEmailChange}
                                    placeholder={"me@university.edu"}
                                    spellCheck={false}
                                    value={userEmail} />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label>
                                    Related Query
                                    <FormText color="muted">If you have a saved query related to your question, select it here.</FormText>
                                </Label>
                                <Dropdown isOpen={dropdownOpen} toggle={this.toggleDropdown} className={`${c}-dropdown`}>
                                    <DropdownToggle>
                                        <div>
                                            No Query
                                            <FaChevronDown className={`${c}-dropdown-chevron`}/>
                                        </div>
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem>No Query</DropdownItem>
                                        <DropdownItem divider={true}></DropdownItem>
                                        <DropdownItem>Query1</DropdownItem>
                                        <DropdownItem>Query2</DropdownItem>
                                        <DropdownItem>Query3</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </FormGroup>
                        </Col>
                    </Row>
                    <FormGroup>
                        <Label>
                            What question or problem are you using Leaf to answer?
                            <FormText color="muted">Please be as descriptive as possible ask in the form of a question.</FormText>
                        </Label>
                        <Input 
                            className="leaf-input"
                            type="textarea"
                            onChange={this.handleQuestionChange}
                            placeholder={
                                "- How many patients have visited the emergency room and had a diagnosis of type 2 diabetes in the same visit?\n" +
                                "- How many patients had medication orders for betapace and previously had an QT Interval over 500 in the past 12 months?\n" +
                                "- How many have had a creatinine test greater than 1.2 in the past 30 days, and what were their previous diagnoses?"
                            }
                            spellCheck={false}
                            value={question} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <Button className={`leaf-button leaf-button-secondary mr-auto`} onClick={this.handleCloseClick}>Cancel</Button>
                    <Button className={`leaf-button leaf-button-primary`} onClick={this.handleSendClick}>Send</Button>
                </ModalFooter>
            </Modal>
        );
    }

    private toggleDropdown = () => {
        this.setState({ dropdownOpen: !this.state.dropdownOpen });
    }

    private handleUserEmailChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({ userEmail: e.currentTarget.value });
    }

    private handleQuestionChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({ question: e.currentTarget.value });
    }

    private handleCloseClick = () => {

    }

    private handleSendClick = () => {

    }
}