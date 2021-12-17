/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import { State as AttestationState } from '../../containers/Attestation/Attestation';
import { SessionType } from '../../models/Session';
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
    public render() {
        const c = this.props.className;
        const { 
            handleApprovalTypeClick, handleUseTypeClick, handleDocumentationTitleChange, handleDocumentationExpDateChange, 
            handleDocumentationInstitutionChange, handlePhiTypeClick, show, parentState 
        } = this.props;
        const { hasApprovedIrb, hasApprovedQi, sessionTypeSelected, documentationExpDateString, attestation } = parentState;
        const { sessionType } = parentState.attestation;
        const contentClass = `${c}-content ${show ? 'show' : ''}`
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
                                onClick={handleUseTypeClick.bind(null, SessionType.QualityImprovement)}>
                                <span>Quality Improvement</span>
                            </div>
                            <div 
                                className={this.setUseTypeButtonClass(SessionType.Research)} 
                                onClick={handleUseTypeClick.bind(null, SessionType.Research)}>
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
                                onClick={handleApprovalTypeClick.bind(this, false)}>
                                <span>No</span>
                            </div>
                            <div 
                                className={this.setDocumentationApprovedClass(true)}
                                onClick={handleApprovalTypeClick.bind(this, true)}>
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
                                onChange={handleDocumentationTitleChange} 
                                placeholder={sessionType === SessionType.Research ? irbIdPlaceholder : qiIdPlaceholder}
                                spellCheck={false}
                                value={attestation.documentation.title} />
                        </FormGroup>
                        <FormGroup>
                            <Label for={`${c}-doc-inst`}>Approving Institution or Body</Label>
                            <Input 
                                className="leaf-input"
                                type="text" 
                                name="doc-inst" 
                                id={`${c}-doc-inst`} 
                                onChange={handleDocumentationInstitutionChange} 
                                placeholder={sessionType === SessionType.Research ? irbInstPlaceholder : qiInstPlaceholder}
                                spellCheck={false}
                                value={attestation.documentation.institution} />
                        </FormGroup>
                        <FormGroup>
                            <Label for={`${c}-doc-expdate`}>Expiration Date</Label>
                            <Input 
                                className="leaf-input"
                                type="text" 
                                name="doc-expdate" 
                                id={`${c}-doc-expdate`} 
                                onChange={handleDocumentationExpDateChange} 
                                placeholder="MM/DD/YYYY"
                                spellCheck={false}
                                value={documentationExpDateString} />
                            {documentationExpDateString && !attestation.documentation.expirationDate &&
                            <span className={`${c}-invalid-date`}>Enter a future date in the format "MM/DD/YYYY"</span>
                            }
                        </FormGroup>
                    </AttestationRow>
                    }
                    {this.showPhiTypeRow() &&
                    <AttestationRow className={`${c}-row`}>
                        <div className={`${c}-row-text`}>I would like Protected Health Information</div>
                        <div className={`${c}-option-container`}>
                            <div 
                                className={this.setPhiTypeButtonClass(false)}
                                onClick={handlePhiTypeClick.bind(null, false)}>
                                <span>De-Identified</span>
                            </div>
                            <div 
                                className={this.setPhiTypeButtonClass(true)}
                                onClick={handlePhiTypeClick.bind(null, true)}>
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
        } else if (this.props.allowPhiIdentified()) {
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
        } else if (isIdentified && (!this.props.allowPhiIdentified() || !userContext!.isPhiOkay)) {
            return `${className}-button disabled`;
        } else {
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