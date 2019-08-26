/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button } from 'reactstrap';
import { SessionType } from '../../models/Session'

interface Props {
    className: string;
    handleGoBackClick: () => void;
    handleIAgreeClick: () => void;
    hasAttested: boolean;
    isIdentified: boolean;
    isSubmittingAttestation: boolean;
    show: boolean;
    sessionLoadDisplay: string;
    sessionType: SessionType;
}

export default class AttestationConfirmation extends React.PureComponent<Props> {
    public render() {
        const c = this.props.className;
        const confirmationClass = `${c}-confirmation-container ${this.props.show ? 'show' : ''}`
        const { isIdentified, sessionType } = this.props;
        const useDisplay = sessionType === SessionType.Research ? 'Research' : 'Quality Improvement';
        const phiDisplay = isIdentified ? 'Identified' : 'Deidentified';

        return  (
            <div className={confirmationClass}>
                <div className={`${c}-confirmation-settings`}>
                    {useDisplay} - {phiDisplay}
                </div>
                <p>
                    I attest that the information I have entered is accurate and I will
                    use the application, Leaf, as I have indicated.
                </p>
                {!(this.props.isSubmittingAttestation || this.props.hasAttested) &&
                <div className={`${c}-confirmation-footer`}>
                    <Button 
                        onClick={this.props.handleGoBackClick} 
                        tabIndex={-1}
                        className="leaf-button mr-auto">
                        Go Back
                    </Button>
                    <Button 
                        onClick={this.props.handleIAgreeClick} 
                        tabIndex={-1}
                        className="leaf-button leaf-button-primary" 
                        style={{ float: 'right' }}>
                        I Agree
                    </Button>
                </div>
                }
                {(this.props.isSubmittingAttestation || this.props.hasAttested) &&
                    <div className={`${c}-session-load-display-container`}>
                        <div className={`${c}-session-load-display`}>
                            <span>...{this.props.sessionLoadDisplay}</span>
                        </div>
                    </div>
                }
            </div>
        );
    }
}