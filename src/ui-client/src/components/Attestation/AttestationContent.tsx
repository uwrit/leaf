/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import { State as AttestationState } from '../../containers/Attestation/Attestation';
import { Attestation as AttestationModel, DocumentationApproval, SessionType } from '../../models/Session';
import AttestationRow from './AttestationRow';
import { UserContext } from '../../models/Auth';

interface Props {
    className: string;
    allowPhiIdentified: () => boolean;
    handleUseTypeClick: (sessionType: SessionType) => void;
    handleApprovalTypeClick: (approved: boolean) => void;
    handlePhiTypeClick: (isIdentified: boolean) => void;
    handleDocumentationTitleChange: (e: any) => void;
    handleDocumentationInstitutionChange: (e: any) => void;
    handleDocumentationExpDateChange: (e: any) => void;
    parentState: AttestationState;
    show: boolean;
    userContext?: UserContext;
}

export default class AttestationContent extends React.PureComponent<Props> {

    constructor(props: Props) {
        super(props);
    }

    public render() {
        const c = this.props.className;
        const contentClass = `${c}-content ${this.props.show ? 'show' : ''}`
        const { hasApprovedIrb, hasApprovedQi, sessionTypeSelected } = this.props.parentState;
        const { sessionType } = this.props.parentState.attestation;
        const irbIdLabel = 'IRB Number or ID';
        const irbIdPlaceholder = 'e.g., HSD 1234';
        const irbInstPlaceholder = 'e.g., University of ABC Human Subjects Division';
        const qiIdLabel = 'QI Document Title';
        const qiIdPlaceholder = 'QI Document Title';
        const qiInstPlaceholder = 'e.g., ABC Medical Center Quality Improvement';

        return (
                <div className={contentClass}>
                    <AttestationRow className={`${c}-row`}>    
                        <div className={`${c}-row-text`}>I want to find information for</div>
                        <div className={`${c}-option-container`}>
                            <div 
                                className={this.setUseTypeButtonClass(SessionType.QualityImprovement)} 
                                onClick={this.props.handleUseTypeClick.bind(null, SessionType.QualityImprovement)}>
                                <span>Quality Improvement</span>
                            </div>
                            <div 
                                className={this.setUseTypeButtonClass(SessionType.Research)} 
                                onClick={this.props.handleUseTypeClick.bind(null, SessionType.Research)}>
                                <span>Research</span>
                            </div>
                        </div>
                    </AttestationRow>
                    {sessionTypeSelected &&
                    <AttestationRow className={`${c}-row`}>
                        <div className={`${c}-row-text`}>
                            {sessionType === SessionType.QualityImprovement 
                                ? 'I have Approved QI documentation'
                                : 'I have an Approved IRB'
                            }
                        </div>
                        <div className={`${c}-option-container`}>
                            <div 
                                className={this.setDocumentationApprovedClass(false)}
                                onClick={this.props.handleApprovalTypeClick.bind(this, false)}>
                                <span>No</span>
                            </div>
                            <div 
                                className={this.setDocumentationApprovedClass(true)}
                                onClick={this.props.handleApprovalTypeClick.bind(this, true)}>
                                <span>Yes</span>
                            </div>
                        </div>                            
                    </AttestationRow>
                    }
                    {((sessionType === SessionType.Research && hasApprovedIrb) || (sessionType === SessionType.QualityImprovement && hasApprovedQi)) &&
                    <AttestationRow className={`${c}-row doc-input`}>
                        <FormGroup>
                            <Label for={`${c}-doc-number`}>{sessionType === SessionType.Research ? irbIdLabel : qiIdLabel}</Label>
                            <Input 
                                className="leaf-input"
                                type="text" 
                                name="doc-number" 
                                id={`${c}-doc-number`} 
                                onChange={this.props.handleDocumentationTitleChange} 
                                placeholder={sessionType === SessionType.Research ? irbIdPlaceholder : qiIdPlaceholder}
                                spellCheck={false}
                                value={this.props.parentState.attestation.documentation.title} />
                        </FormGroup>
                        <FormGroup>
                            <Label for={`${c}-doc-inst`}>Approving Institution or Body</Label>
                            <Input 
                                className="leaf-input"
                                type="text" 
                                name="doc-inst" 
                                id={`${c}-doc-inst`} 
                                onChange={this.props.handleDocumentationInstitutionChange} 
                                placeholder={sessionType === SessionType.Research ? irbInstPlaceholder : qiInstPlaceholder}
                                spellCheck={false}
                                value={this.props.parentState.attestation.documentation.institution} />
                        </FormGroup>
                        <FormGroup>
                            <Label for={`${c}-doc-expdate`}>Expiration Date</Label>
                            <Input 
                                className="leaf-input"
                                type="text" 
                                name="doc-expdate" 
                                id={`${c}-doc-expdate`} 
                                onChange={this.props.handleDocumentationExpDateChange} 
                                placeholder="MM/DD/YYYY"
                                spellCheck={false}
                                value={this.props.parentState.documentationExpDateString} />
                        </FormGroup>
                    </AttestationRow>
                    }
                    {this.showPhiTypeRow() &&
                    <AttestationRow className={`${c}-row`}>
                        <div className={`${c}-row-text`}>I would like Protected Health Information</div>
                        <div className={`${c}-option-container`}>
                            <div 
                                className={this.setPhiTypeButtonClass(false)}
                                onClick={this.props.handlePhiTypeClick.bind(null, false)}>
                                <span>De-Identified</span>
                            </div>
                            <div 
                                className={this.setPhiTypeButtonClass(true)}
                                onClick={this.props.handlePhiTypeClick.bind(null, true)}>
                                <span>Identified</span>
                            </div>
                        </div>                            
                    </AttestationRow>
                    }
                </div>
        );
    }

    private showPhiTypeRow = () => {
        const { documentationStatusSelected, hasApprovedIrb, hasApprovedQi } = this.props.parentState;
        if (documentationStatusSelected && !(hasApprovedIrb || hasApprovedQi)) {
            return true;
        }
        else if (this.props.allowPhiIdentified()) {
            return true;
        }
        return false;
    }

    private setUseTypeButtonClass = (sessionType: SessionType) => {
        return this.props.parentState.sessionTypeSelected && this.props.parentState.attestation.sessionType === sessionType
            ? `${this.props.className}-button selected`
            : `${this.props.className}-button`;
    }

    private setPhiTypeButtonClass = (isIdentified: boolean) => {
        const { className, userContext } = this.props;
        const { attestation , identificationTypeSelected } = this.props.parentState;
        if (isIdentified === attestation.isIdentified && identificationTypeSelected) {
            return `${className}-button selected`;
        }
        else if (isIdentified && (!this.props.allowPhiIdentified() || !userContext!.isPhiOkay)) {
            return `${className}-button disabled`;
        }
        else {
            return `${className}-button`;
        }
    }

    private setDocumentationApprovedClass = (hasApproval: boolean) => {
        const approved = this.props.parentState.attestation.sessionType === SessionType.Research
            ? this.props.parentState.hasApprovedIrb
            : this.props.parentState.hasApprovedQi;
        return this.props.parentState.documentationStatusSelected && approved === hasApproval
            ? `${this.props.className}-button selected`
            : `${this.props.className}-button`;
    }
}